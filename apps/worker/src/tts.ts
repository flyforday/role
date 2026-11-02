import { intVar, type Env } from './env';
import { fetchOrThrow, ProviderError } from './providers/types';

/** Synthèse vocale du MJ via les modèles TTS de Gemini (offre gratuite, même clé que le texte). */

export const DEFAULT_TTS_MODELS = 'gemini-2.5-flash-preview-tts';
/** Algenib : voix masculine grave et rocailleuse, la plus « conteur au coin du feu » du catalogue. */
export const DEFAULT_TTS_VOICE = 'Algenib';
export const TTS_VOICES = ['Algenib', 'Charon', 'Enceladus', 'Fenrir', 'Gacrux', 'Iapetus', 'Orus', 'Rasalgethi', 'Sadaltager', 'Schedar'];
export const MAX_TTS_CHARS = 3000;

const STYLE =
  "Lis le texte suivant en français, comme un maître du jeu qui raconte une aventure de jeu de rôle autour d'un feu : " +
  'voix grave, posée et chaleureuse, ton mystérieux, rythme lent, avec de courtes pauses dramatiques. Ne lis pas cette consigne.\n\n';

export interface TtsBody {
  text: string;
  voice: string;
}

export function validateTtsBody(raw: unknown, env: Env): TtsBody {
  if (!raw || typeof raw !== 'object') throw new Error('Corps JSON attendu');
  const b = raw as Record<string, unknown>;
  if (typeof b.text !== 'string' || !b.text.trim()) throw new Error('texte manquant');
  if (b.text.length > MAX_TTS_CHARS) throw new Error(`texte trop long (max ${MAX_TTS_CHARS} caractères)`);
  const fallbackVoice = env.GEMINI_TTS_VOICE || DEFAULT_TTS_VOICE;
  const voice = typeof b.voice === 'string' && TTS_VOICES.includes(b.voice) ? b.voice : fallbackVoice;
  return { text: b.text.trim(), voice };
}

/** Appelle Gemini TTS (modèles essayés dans l'ordre) et renvoie un fichier WAV. */
export async function synthesize(body: TtsBody, env: Env, signal?: AbortSignal): Promise<{ wav: Uint8Array; model: string }> {
  if (!env.GEMINI_API_KEY) throw new ProviderError('Synthèse vocale non configurée sur le relais', 503, 'tts');
  const models = (env.GEMINI_TTS_MODEL || DEFAULT_TTS_MODELS).split(',').map((m) => m.trim()).filter(Boolean);
  const failures: string[] = [];
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
      const res = await fetchOrThrow(
        'gemini-tts',
        url,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: STYLE + body.text }] }],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: body.voice } } },
            },
          }),
          signal,
        },
        intVar(env.TTS_TIMEOUT_MS, 60_000),
      );
      const data = (await res.json()) as any;
      const part = (data?.candidates?.[0]?.content?.parts ?? []).find((p: any) => p?.inlineData?.data);
      if (!part) throw new ProviderError('gemini-tts : réponse sans audio', 502, 'gemini-tts');
      const mime: string = part.inlineData.mimeType ?? '';
      const pcm = base64ToBytes(part.inlineData.data);
      const rate = Number(/rate=(\d+)/.exec(mime)?.[1]) || 24000;
      return { wav: /wav/i.test(mime) ? pcm : pcmToWav(pcm, rate), model };
    } catch (e) {
      if (signal?.aborted) throw e;
      failures.push(`${model} : ${(e as Error).message}`);
      // Une erreur de requête (texte refusé…) ne s'arrangera pas avec un autre modèle.
      if (e instanceof ProviderError && e.status === 400) break;
    }
  }
  const quota = failures.some((f) => /\b429\b/.test(f));
  throw new ProviderError(
    quota ? 'Quota de synthèse vocale atteint pour aujourd’hui' : `Synthèse vocale indisponible (${failures.join(' ; ').slice(0, 300)})`,
    quota ? 429 : 502,
    'gemini-tts',
  );
}

export function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Enveloppe du PCM 16 bits mono dans un en-tête WAV lisible par tous les navigateurs. */
export function pcmToWav(pcm: Uint8Array, sampleRate: number): Uint8Array {
  const out = new Uint8Array(44 + pcm.length);
  const v = new DataView(out.buffer);
  const str = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF');
  v.setUint32(4, 36 + pcm.length, true);
  str(8, 'WAVE');
  str(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); // PCM
  v.setUint16(22, 1, true); // mono
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  str(36, 'data');
  v.setUint32(40, pcm.length, true);
  out.set(pcm, 44);
  return out;
}
