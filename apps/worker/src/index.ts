import { intVar, type Env } from './env';
import { completeWithFallback } from './fallback';
import { RateLimiter } from './ratelimit';
import { BYOK_PROVIDERS, configuredProviders, DEFAULT_MODELS, makeProvider, type ByokProviderName } from './providers/registry';
import { ProviderError, type ChatMessage, type LLMProvider } from './providers/types';
import { synthesize, validateTtsBody } from './tts';
import { isValidCode, normalizeCode, randomCode, MAX_STATE_CHARS } from './salle';

export { Salle } from './salle';

const limiter = new RateLimiter();

const MAX_MESSAGES = 40;
const MAX_CHARS = 120_000;

interface ChatBody {
  messages: ChatMessage[];
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
  gameId?: string;
  byok?: { provider: ByokProviderName; apiKey: string; model?: string };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return handle(request, env, limiter);
  },
};

export async function handle(request: Request, env: Env, rl: RateLimiter): Promise<Response> {
  const cors = corsHeaders(request, env);
  if (request.method === 'OPTIONS') return new Response(null, { status: cors ? 204 : 403, headers: cors ?? {} });
  if (!cors) return json({ error: 'Origine non autorisée' }, 403, {});

  const url = new URL(request.url);
  if (url.pathname === '/api/health' && request.method === 'GET') {
    return json({ ok: true, multijoueur: !!env.SALLES, providers: configuredProviders(env).map((p) => ({ name: p.name, model: p.model })), tts: Boolean(env.GEMINI_API_KEY) }, 200, cors);
  }
  if (url.pathname === '/api/tts' && request.method === 'POST') return handleTts(request, env, rl, cors);
  if (url.pathname.startsWith('/api/salle')) return handleSalle(request, env, rl, url, cors);
  if (url.pathname !== '/api/chat' || request.method !== 'POST') return json({ error: 'Introuvable' }, 404, cors);

  let body: ChatBody;
  try {
    body = validateBody(await request.json());
  } catch (e) {
    return json({ error: (e as Error).message }, 400, cors);
  }

  const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for') ?? 'inconnu';
  const perMin = intVar(env.RATE_LIMIT_PER_IP_PER_MIN, 20);
  const retry =
    rl.hit(`ip:${ip}`, perMin, 60_000) ||
    rl.hit(`ipj:${ip}`, intVar(env.RATE_LIMIT_PER_IP_PER_DAY, 600), 86_400_000) ||
    (!body.byok && body.gameId ? rl.hit(`partie:${body.gameId}`, intVar(env.RATE_LIMIT_PER_GAME_PER_MIN, 12), 60_000) : 0);
  if (retry) {
    return json({ error: `Trop de requêtes, réessayez dans ${retry} s.` }, 429, { ...cors, 'retry-after': String(retry) });
  }

  const providers: LLMProvider[] = [];
  if (body.byok) providers.push(makeProvider(body.byok.provider, body.byok.apiKey, body.byok.model || DEFAULT_MODELS[body.byok.provider], env));
  providers.push(...configuredProviders(env));

  try {
    const result = await completeWithFallback(providers, body.messages, {
      json: body.json,
      temperature: body.temperature,
      maxTokens: Math.min(body.maxTokens ?? 1500, intVar(env.MAX_OUTPUT_TOKENS, 1500)),
      signal: request.signal,
    }, intVar(env.QUOTA_COOLDOWN_S, 120) * 1000);
    const encoder = new TextEncoder();
    const bytes = result.stream.pipeThrough(
      new TransformStream<string, Uint8Array>({ transform: (chunk, c) => c.enqueue(encoder.encode(chunk)) }),
    );
    return new Response(bytes, {
      headers: {
        ...cors,
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store',
        'x-provider': `${result.provider.name}/${result.provider.model}`,
        ...(result.failures.length ? { 'x-provider-failures': result.failures.join(', ') } : {}),
      },
    });
  } catch (e) {
    const err = e instanceof ProviderError ? e : new ProviderError((e as Error).message, 500, 'relais');
    return json({ error: err.message }, err.status || 503, cors);
  }
}

async function handleTts(request: Request, env: Env, rl: RateLimiter, cors: Record<string, string>): Promise<Response> {
  let body;
  try {
    body = validateTtsBody(await request.json(), env);
  } catch (e) {
    return json({ error: (e as Error).message }, 400, cors);
  }
  const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for') ?? 'inconnu';
  const retry =
    rl.hit(`tts:${ip}`, intVar(env.RATE_LIMIT_PER_IP_PER_MIN, 20), 60_000) ||
    rl.hit(`ttsj:${ip}`, intVar(env.TTS_PER_IP_PER_DAY, 80), 86_400_000);
  if (retry) return json({ error: `Trop de lectures, réessayez dans ${retry} s.` }, 429, { ...cors, 'retry-after': String(retry) });
  try {
    const { wav, model } = await synthesize(body, env, request.signal);
    return new Response(wav, {
      headers: { ...cors, 'content-type': 'audio/wav', 'cache-control': 'no-store', 'x-provider': `gemini/${model}` },
    });
  } catch (e) {
    const err = e instanceof ProviderError ? e : new ProviderError((e as Error).message, 500, 'tts');
    return json({ error: err.message }, err.status || 503, cors);
  }
}

/** Parties multijoueur : création (code), infos publiques et connexion WebSocket à la salle. */
async function handleSalle(request: Request, env: Env, rl: RateLimiter, url: URL, cors: Record<string, string>): Promise<Response> {
  if (!env.SALLES) return json({ error: "Le multijoueur n'est pas activé sur ce relais." }, 503, cors);
  const ip = request.headers.get('cf-connecting-ip') ?? 'inconnu';
  const parts = url.pathname.split('/').filter(Boolean); // api, salle, [code], [ws|infos]

  if (parts.length === 2 && request.method === 'POST') {
    const retry = rl.hit(`salle:${ip}`, 20, 3_600_000);
    if (retry) return json({ error: `Trop de parties créées, réessayez dans ${retry} s.` }, 429, cors);
    const text = await request.text();
    if (text.length > MAX_STATE_CHARS) return json({ error: 'Partie trop volumineuse' }, 413, cors);
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(text);
    } catch {
      return json({ error: 'Corps JSON attendu' }, 400, cors);
    }
    for (let i = 0; i < 5; i++) {
      const code = randomCode();
      const stub = env.SALLES.get(env.SALLES.idFromName(code));
      const res = await stub.fetch('https://salle/creer', { method: 'POST', body: JSON.stringify({ ...body, code }) });
      if (res.status === 409) continue; // code déjà pris : on en tire un autre
      return new Response(res.body, { status: res.status, headers: { ...cors, 'content-type': 'application/json; charset=utf-8' } });
    }
    return json({ error: 'Impossible de trouver un code libre, réessayez.' }, 503, cors);
  }

  const code = normalizeCode(parts[2] ?? '');
  const action = parts[3];
  if (!isValidCode(code) || parts.length !== 4 || !['ws', 'infos'].includes(action)) return json({ error: 'Introuvable' }, 404, cors);
  if (action === 'ws') {
    const retry = rl.hit(`ws:${ip}`, 60, 60_000);
    if (retry) return json({ error: 'Trop de connexions' }, 429, cors);
  }
  const stub = env.SALLES.get(env.SALLES.idFromName(code));
  const res = await stub.fetch(new Request(`https://salle/${action}`, request));
  if (action === 'ws') return res;
  return new Response(res.body, { status: res.status, headers: { ...cors, 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}

export function validateBody(raw: unknown): ChatBody {
  if (!raw || typeof raw !== 'object') throw new Error('Corps JSON attendu');
  const b = raw as Record<string, unknown>;
  if (!Array.isArray(b.messages) || b.messages.length === 0) throw new Error('messages manquants');
  if (b.messages.length > MAX_MESSAGES) throw new Error(`trop de messages (max ${MAX_MESSAGES})`);
  let chars = 0;
  const messages: ChatMessage[] = b.messages.map((m: any) => {
    if (!m || !['system', 'user', 'assistant'].includes(m.role) || typeof m.content !== 'string') throw new Error('message invalide');
    chars += m.content.length;
    return { role: m.role, content: m.content };
  });
  if (chars > MAX_CHARS) throw new Error('contexte trop long');
  let byok: ChatBody['byok'];
  if (b.byok) {
    const k = b.byok as Record<string, unknown>;
    if (!(BYOK_PROVIDERS as readonly string[]).includes(k.provider as string) || typeof k.apiKey !== 'string' || k.apiKey.length < 8 || k.apiKey.length > 300) {
      throw new Error('clé personnelle invalide');
    }
    byok = { provider: k.provider as ByokProviderName, apiKey: k.apiKey, model: typeof k.model === 'string' && k.model ? k.model.slice(0, 120) : undefined };
  }
  return {
    messages,
    json: b.json === true,
    temperature: typeof b.temperature === 'number' ? Math.min(2, Math.max(0, b.temperature)) : undefined,
    maxTokens: typeof b.maxTokens === 'number' ? Math.max(64, Math.floor(b.maxTokens)) : undefined,
    gameId: typeof b.gameId === 'string' ? b.gameId.slice(0, 80) : undefined,
    byok,
  };
}

function corsHeaders(request: Request, env: Env): Record<string, string> | null {
  const origin = request.headers.get('origin');
  const allowed = (env.ALLOWED_ORIGINS ?? '*').split(',').map((s) => s.trim()).filter(Boolean);
  const base = {
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-expose-headers': 'x-provider, x-provider-failures, retry-after',
    'access-control-max-age': '86400',
    vary: 'origin',
  };
  if (allowed.includes('*')) return { ...base, 'access-control-allow-origin': '*' };
  if (!origin) return base; // requête non navigateur (curl) : autorisée sans en-tête CORS
  return allowed.includes(origin) ? { ...base, 'access-control-allow-origin': origin } : null;
}

function json(data: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(data), { status, headers: { ...headers, 'content-type': 'application/json; charset=utf-8' } });
}
