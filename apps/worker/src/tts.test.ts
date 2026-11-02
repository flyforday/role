import { afterEach, describe, expect, it, vi } from 'vitest';
import { handle } from './index';
import { RateLimiter } from './ratelimit';
import { pcmToWav } from './tts';
import type { Env } from './env';

const env: Env = { GEMINI_API_KEY: 'g-key-123456', ALLOWED_ORIGINS: '*', GEMINI_TTS_MODEL: 'tts-a,tts-b' };

function tts(body: unknown) {
  return new Request('https://relais.test/api/tts', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': '1.2.3.4' },
    body: JSON.stringify(body),
  });
}

const pcm = new Uint8Array([1, 2, 3, 4]);
const audio = () =>
  Response.json({ candidates: [{ content: { parts: [{ inlineData: { mimeType: 'audio/L16;codec=pcm;rate=24000', data: btoa(String.fromCharCode(...pcm)) } }] } }] });

afterEach(() => vi.unstubAllGlobals());

describe('synthèse vocale', () => {
  it('renvoie un WAV avec la voix demandée et la consigne de conteur', async () => {
    const fetchMock = vi.fn(async () => audio());
    vi.stubGlobal('fetch', fetchMock);
    const res = await handle(tts({ text: 'La porte grince.', voice: 'Charon' }), env, new RateLimiter());
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('audio/wav');
    const bytes = new Uint8Array(await res.arrayBuffer());
    expect(new TextDecoder().decode(bytes.slice(0, 4))).toBe('RIFF');
    expect([...bytes.slice(44)]).toEqual([...pcm]);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain('/models/tts-a:generateContent');
    expect(url).not.toContain('g-key');
    const sent = JSON.parse(init.body as string);
    expect(sent.generationConfig.responseModalities).toEqual(['AUDIO']);
    expect(sent.generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName).toBe('Charon');
    expect(sent.contents[0].parts[0].text).toMatch(/maître du jeu[\s\S]*La porte grince\.$/);
  });

  it('remplace une voix inconnue par la voix par défaut', async () => {
    const fetchMock = vi.fn(async () => audio());
    vi.stubGlobal('fetch', fetchMock);
    await handle(tts({ text: 'Bonsoir.', voice: 'Inconnue' }), env, new RateLimiter());
    const sent = JSON.parse((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(sent.generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName).toBe('Algenib');
  });

  it('essaie le modèle suivant puis signale le quota', async () => {
    const fetchMock = vi.fn(async (url: string) => (url.includes('tts-a') ? new Response('quota', { status: 429 }) : audio()));
    vi.stubGlobal('fetch', fetchMock);
    const ok = await handle(tts({ text: 'Bonsoir.' }), env, new RateLimiter());
    expect(ok.status).toBe(200);
    expect(ok.headers.get('x-provider')).toBe('gemini/tts-b');

    vi.stubGlobal('fetch', vi.fn(async () => new Response('quota', { status: 429 })));
    const ko = await handle(tts({ text: 'Bonsoir.' }), env, new RateLimiter());
    expect(ko.status).toBe(429);
    expect(((await ko.json()) as { error: string }).error).toMatch(/Quota/);
  });

  it('refuse un texte vide ou trop long, et sans clé', async () => {
    vi.stubGlobal('fetch', vi.fn());
    expect((await handle(tts({ text: '  ' }), env, new RateLimiter())).status).toBe(400);
    expect((await handle(tts({ text: 'x'.repeat(3001) }), env, new RateLimiter())).status).toBe(400);
    expect((await handle(tts({ text: 'Bonsoir.' }), { ALLOWED_ORIGINS: '*' }, new RateLimiter())).status).toBe(503);
  });

  it('limite le nombre de lectures par jour', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => audio()));
    const rl = new RateLimiter();
    const e = { ...env, TTS_PER_IP_PER_DAY: '2' };
    expect((await handle(tts({ text: 'a' }), e, rl)).status).toBe(200);
    expect((await handle(tts({ text: 'b' }), e, rl)).status).toBe(200);
    expect((await handle(tts({ text: 'c' }), e, rl)).status).toBe(429);
  });

  it('écrit un en-tête WAV correct', () => {
    const wav = pcmToWav(new Uint8Array(10), 24000);
    const v = new DataView(wav.buffer);
    expect(v.getUint32(24, true)).toBe(24000);
    expect(v.getUint32(40, true)).toBe(10);
  });
});
