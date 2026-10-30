import { afterEach, describe, expect, it, vi } from 'vitest';
import { handle } from './index';
import { RateLimiter } from './ratelimit';
import type { Env } from './env';

function sse(events: unknown[]): Response {
  const body = events.map((e) => `data: ${typeof e === 'string' ? e : JSON.stringify(e)}\n\n`).join('');
  // découpe volontaire au milieu d'un événement
  const mid = Math.floor(body.length / 2);
  const enc = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      c.enqueue(enc.encode(body.slice(0, mid)));
      c.enqueue(enc.encode(body.slice(mid)));
      c.close();
    },
  });
  return new Response(stream, { status: 200, headers: { 'content-type': 'text/event-stream' } });
}

const gemini = (texts: string[]) => sse(texts.map((t) => ({ candidates: [{ content: { parts: [{ text: t }] } }] })));
const openai = (texts: string[]) => sse([...texts.map((t) => ({ choices: [{ delta: { content: t } }] })), '[DONE]']);

const env: Env = { GEMINI_API_KEY: 'g-key-123456', GROQ_API_KEY: 'groq-key-1234', ALLOWED_ORIGINS: '*', GEMINI_THINKING_BUDGET: '0' };

function chat(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://relais.test/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': '1.2.3.4', ...headers },
    body: JSON.stringify(body),
  });
}

const messages = [
  { role: 'system', content: 'Tu es le MJ.' },
  { role: 'user', content: 'Je frappe à la porte.' },
];

afterEach(() => vi.unstubAllGlobals());

describe('relais IA', () => {
  it('relaie Gemini en flux texte', async () => {
    const fetchMock = vi.fn(async () => gemini(['{"narration":', '"Bonjour"}']));
    vi.stubGlobal('fetch', fetchMock);
    const res = await handle(chat({ messages, json: true }), env, new RateLimiter());
    expect(res.status).toBe(200);
    expect(res.headers.get('x-provider')).toBe('gemini/gemini-flash-latest');
    expect(await res.text()).toBe('{"narration":"Bonjour"}');
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain(':streamGenerateContent?alt=sse');
    const sent = JSON.parse(init.body as string);
    expect(sent.systemInstruction.parts[0].text).toBe('Tu es le MJ.');
    expect(sent.generationConfig.responseMimeType).toBe('application/json');
    expect(sent.generationConfig.thinkingConfig).toEqual({ thinkingBudget: 0 });
    // la clé n'est jamais dans l'URL
    expect(url).not.toContain('g-key');
  });

  it('bascule vers Groq quand Gemini renvoie 429', async () => {
    const fetchMock = vi.fn(async (url: string) => (url.includes('googleapis') ? new Response('quota', { status: 429 }) : openai(['Salut', ' !'])));
    vi.stubGlobal('fetch', fetchMock);
    const res = await handle(chat({ messages }), env, new RateLimiter());
    expect(res.status).toBe(200);
    expect(res.headers.get('x-provider')).toMatch(/^groq\//);
    expect(res.headers.get('x-provider-failures')).toBe('gemini gemini-flash-latest: 429');
    expect(await res.text()).toBe('Salut !');
  });

  it('envoie le niveau de réflexion et le retire si le modèle le refuse', async () => {
    const bodies: Array<{ generationConfig: { thinkingConfig?: unknown } }> = [];
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string);
      bodies.push(body);
      return body.generationConfig.thinkingConfig
        ? new Response('Thinking level is not supported for this model.', { status: 400 })
        : gemini(['ok']);
    });
    vi.stubGlobal('fetch', fetchMock);
    const res = await handle(chat({ messages }), { ...env, GEMINI_THINKING_LEVEL: 'low' }, new RateLimiter());
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('ok');
    expect(bodies[0].generationConfig.thinkingConfig).toEqual({ thinkingLevel: 'low' });
    expect(bodies[1].generationConfig.thinkingConfig).toBeUndefined();
  });

  it('essaie chaque modèle Gemini de la liste avant de changer de fournisseur', async () => {
    const urls: string[] = [];
    const fetchMock = vi.fn(async (url: string) => {
      urls.push(url);
      return url.includes('gemini-a') ? new Response('surcharge', { status: 503 }) : gemini(['ok']);
    });
    vi.stubGlobal('fetch', fetchMock);
    const res = await handle(chat({ messages }), { ...env, GEMINI_MODEL: 'gemini-a, gemini-b' }, new RateLimiter());
    expect(res.headers.get('x-provider')).toBe('gemini/gemini-b');
    expect(res.headers.get('x-provider-failures')).toBe('gemini gemini-a: 503');
    expect(urls).toHaveLength(2);
  });

  it('bascule quand un fournisseur ne répond pas à temps', async () => {
    vi.useFakeTimers();
    try {
      const fetchMock = vi.fn((url: string, init: RequestInit) =>
        url.includes('googleapis')
          ? new Promise<Response>((_, reject) => init.signal?.addEventListener('abort', () => reject(new Error('aborted'))))
          : Promise.resolve(openai(['vite'])),
      );
      vi.stubGlobal('fetch', fetchMock);
      const pending = handle(chat({ messages }), env, new RateLimiter());
      await vi.advanceTimersByTimeAsync(41_000);
      const res = await pending;
      expect(res.headers.get('x-provider')).toMatch(/^groq\//);
      expect(res.headers.get('x-provider-failures')).toBe('gemini gemini-flash-latest: 504');
    } finally {
      vi.useRealTimers();
    }
  });

  it('utilise gpt-oss sur Groq avec un effort de raisonnement bas', async () => {
    const bodies: Array<Record<string, unknown>> = [];
    const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
      if (url.includes('googleapis')) return new Response('quota', { status: 429 });
      bodies.push(JSON.parse(init.body as string));
      return openai(['ok']);
    });
    vi.stubGlobal('fetch', fetchMock);
    const res = await handle(chat({ messages }), env, new RateLimiter());
    expect(res.headers.get('x-provider')).toBe('groq/openai/gpt-oss-120b');
    expect(bodies[0]).toMatchObject({ model: 'openai/gpt-oss-120b', reasoning_effort: 'low' });
  });

  it('renvoie 503 quand tous les fournisseurs échouent', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('down', { status: 500 })));
    const res = await handle(chat({ messages }), env, new RateLimiter());
    expect(res.status).toBe(503);
    expect(((await res.json()) as { error: string }).error).toMatch(/Aucun fournisseur/);
  });

  it('utilise d\'abord la clé personnelle (BYOK) sans la conserver', async () => {
    const fetchMock = vi.fn(async (_url: string, _init: RequestInit) => openai(['ok']));
    vi.stubGlobal('fetch', fetchMock);
    const res = await handle(chat({ messages, byok: { provider: 'openrouter', apiKey: 'sk-or-perso-123' } }), env, new RateLimiter());
    expect(res.headers.get('x-provider')).toMatch(/^openrouter\//);
    const init = fetchMock.mock.calls[0][1];
    expect((init.headers as Record<string, string>).authorization).toBe('Bearer sk-or-perso-123');
  });

  it('limite le débit par IP et par partie', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => gemini(['x'])));
    const rl = new RateLimiter(() => 1000);
    const e = { ...env, RATE_LIMIT_PER_GAME_PER_MIN: '2' };
    expect((await handle(chat({ messages, gameId: 'p1' }), e, rl)).status).toBe(200);
    expect((await handle(chat({ messages, gameId: 'p1' }), e, rl)).status).toBe(200);
    const limited = await handle(chat({ messages, gameId: 'p1' }), e, rl);
    expect(limited.status).toBe(429);
    expect(limited.headers.get('retry-after')).toBe('60');
    expect((await handle(chat({ messages, gameId: 'p2' }), e, rl)).status).toBe(200);
  });

  it('valide le corps de la requête', async () => {
    const rl = new RateLimiter();
    expect((await handle(chat({}), env, rl)).status).toBe(400);
    expect((await handle(chat({ messages: [{ role: 'hacker', content: 'x' }] }), env, rl)).status).toBe(400);
    expect((await handle(chat({ messages, byok: { provider: 'inconnu', apiKey: 'xxxxxxxxxx' } }), env, rl)).status).toBe(400);
  });

  it('applique la liste des origines autorisées', async () => {
    const e = { ...env, ALLOWED_ORIGINS: 'https://veillee.pages.dev' };
    const bad = await handle(chat({ messages }, { origin: 'https://pirate.example' }), e, new RateLimiter());
    expect(bad.status).toBe(403);
    vi.stubGlobal('fetch', vi.fn(async () => gemini(['x'])));
    const good = await handle(chat({ messages }, { origin: 'https://veillee.pages.dev' }), e, new RateLimiter());
    expect(good.headers.get('access-control-allow-origin')).toBe('https://veillee.pages.dev');
  });

  it('expose l\'état des fournisseurs sans les clés', async () => {
    const res = await handle(new Request('https://relais.test/api/health'), env, new RateLimiter());
    const body = (await res.json()) as { providers: Array<{ name: string }> };
    expect(body.providers.map((p: { name: string }) => p.name)).toEqual(['gemini', 'groq']);
    expect(JSON.stringify(body)).not.toContain('key');
  });
});
