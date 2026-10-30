import { intVar, type Env } from './env';
import { completeWithFallback } from './fallback';
import { RateLimiter } from './ratelimit';
import { configuredProviders, DEFAULT_MODELS, makeProvider, PROVIDER_NAMES, type ProviderName } from './providers/registry';
import { ProviderError, type ChatMessage, type LLMProvider } from './providers/types';

const limiter = new RateLimiter();

const MAX_MESSAGES = 40;
const MAX_CHARS = 120_000;

interface ChatBody {
  messages: ChatMessage[];
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
  gameId?: string;
  byok?: { provider: ProviderName; apiKey: string; model?: string };
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
    return json({ ok: true, providers: configuredProviders(env).map((p) => ({ name: p.name, model: p.model })) }, 200, cors);
  }
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
    });
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
    if (!PROVIDER_NAMES.includes(k.provider as ProviderName) || typeof k.apiKey !== 'string' || k.apiKey.length < 8 || k.apiKey.length > 300) {
      throw new Error('clé personnelle invalide');
    }
    byok = { provider: k.provider as ProviderName, apiKey: k.apiKey, model: typeof k.model === 'string' && k.model ? k.model.slice(0, 120) : undefined };
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
