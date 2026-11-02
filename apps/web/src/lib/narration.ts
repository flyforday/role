import { useSyncExternalStore } from 'react';
import { getSettings, workerBase } from './settings';

/**
 * Narration vocale du MJ : voix « conteur » générée par le relais (Gemini TTS, offre gratuite),
 * avec repli sur la synthèse vocale du navigateur (Web Speech API) si le relais ne répond pas
 * ou si le quota du jour est épuisé.
 */

export const NARRATOR_VOICES: Array<[string, string]> = [
  ['Algenib', 'Algenib — grave et rocailleuse (conseillée)'],
  ['Charon', 'Charon — posée, voix de conteur'],
  ['Iapetus', 'Iapetus — claire et calme'],
  ['Gacrux', 'Gacrux — mûre, voix de vieux sage'],
  ['Enceladus', 'Enceladus — soufflée, mystérieuse'],
  ['Fenrir', 'Fenrir — vive, pour l’action'],
];

const MAX_CHUNK = 2800;

interface NarrationState {
  /** Identifiant du texte en cours (lecture ou chargement). */
  id: string | null;
  loading: boolean;
  /** Message affiché quand on a dû basculer sur la voix du navigateur. */
  notice: string | null;
}

let state: NarrationState = { id: null, loading: false, notice: null };
const listeners = new Set<() => void>();
function set(patch: Partial<NarrationState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function useNarration(): NarrationState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}

/** Retire la mise en forme qui ne doit pas être lue (astérisques, titres Markdown…). */
export function cleanForSpeech(text: string): string {
  return text
    .replace(/[*_`#>~]+/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

/** Découpe un long texte en morceaux d'au plus `max` caractères, aux fins de paragraphe ou de phrase. */
export function splitForSpeech(text: string, max = MAX_CHUNK): string[] {
  const out: string[] = [];
  let cur = '';
  const pieces = text.split(/(?<=[.!?…»])\s+|\n+/).filter(Boolean);
  for (const piece of pieces) {
    if (piece.length > max) {
      if (cur) out.push(cur), (cur = '');
      for (let i = 0; i < piece.length; i += max) out.push(piece.slice(i, i + max));
      continue;
    }
    if (cur && cur.length + 1 + piece.length > max) out.push(cur), (cur = piece);
    else cur = cur ? `${cur} ${piece}` : piece;
  }
  if (cur) out.push(cur);
  return out;
}

const cache = new Map<string, Promise<string>>(); // texte → URL d'objet audio
let session = 0;
let audio: HTMLAudioElement | null = null;
let aborter: AbortController | null = null;
/** Après un quota épuisé, inutile de réessayer le relais pendant un moment. */
let relayPausedUntil = 0;

function fetchAudio(text: string, signal: AbortSignal): Promise<string> {
  const voice = getSettings().narratorVoice;
  const key = `${voice}|${text}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const p = (async () => {
    const res = await fetch(`${workerBase()}/api/tts`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text, voice }),
      signal,
    });
    if (!res.ok) {
      const msg = await res.json().then((d: { error?: string }) => d.error).catch(() => '');
      if (res.status === 429) relayPausedUntil = Date.now() + 10 * 60_000;
      throw new Error(msg || `relais ${res.status}`);
    }
    return URL.createObjectURL(await res.blob());
  })();
  cache.set(key, p);
  p.catch(() => cache.delete(key));
  if (cache.size > 60) {
    const [oldKey, old] = cache.entries().next().value as [string, Promise<string>];
    cache.delete(oldKey);
    old.then((u) => URL.revokeObjectURL(u)).catch(() => {});
  }
  return p;
}

function playUrl(url: string, my: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (my !== session) return resolve();
    audio = new Audio(url);
    audio.onended = () => resolve();
    audio.onpause = () => resolve();
    audio.onerror = () => reject(new Error('lecture audio impossible'));
    audio.play().catch(reject);
  });
}

export function speechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** Choisit la voix française du navigateur la plus grave possible (voix masculines connues en priorité). */
function pickBrowserVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('fr'));
  const male = /thomas|paul|henri|daniel|nicolas|antoine|mathieu|claude|guillaume|gérard|jacques|male|homme|masculin/i;
  return (
    voices.find((v) => male.test(v.name) && /natural|online|neural|premium|enhanced/i.test(v.name)) ??
    voices.find((v) => male.test(v.name)) ??
    voices.find((v) => /natural|online|neural|premium|enhanced|google/i.test(v.name)) ??
    voices[0]
  );
}

function speakBrowser(chunks: string[], my: number): Promise<void> {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const voice = pickBrowserVoice();
    let left = chunks.length;
    for (const chunk of chunks) {
      const u = new SpeechSynthesisUtterance(chunk);
      u.lang = voice?.lang ?? 'fr-FR';
      if (voice) u.voice = voice;
      u.pitch = 0.7; // plus grave
      u.rate = 0.9; // plus posé
      u.onend = u.onerror = () => {
        if (--left === 0 || my !== session) resolve();
      };
      synth.speak(u);
    }
  });
}

export function stopNarration() {
  session++;
  aborter?.abort();
  aborter = null;
  if (audio) {
    audio.onpause = null;
    audio.pause();
    audio = null;
  }
  if (speechAvailable()) window.speechSynthesis.cancel();
  set({ id: null, loading: false });
}

/** Lit un texte du MJ. Relancer sur le même identifiant arrête la lecture. */
export async function narrate(id: string, text: string) {
  if (state.id === id) return stopNarration();
  stopNarration();
  const my = session;
  const clean = cleanForSpeech(text);
  const chunks = splitForSpeech(clean);
  if (!chunks.length) return;
  set({ id, loading: true, notice: null });
  const useRelay = getSettings().narratorEngine === 'ia' && Date.now() >= relayPausedUntil;
  try {
    if (!useRelay) throw new Error('voix du navigateur choisie');
    aborter = new AbortController();
    const signal = aborter.signal;
    let next = fetchAudio(chunks[0], signal);
    for (let i = 0; i < chunks.length; i++) {
      const url = await next;
      if (my !== session) return;
      if (i + 1 < chunks.length) next = fetchAudio(chunks[i + 1], signal); // préchargement du morceau suivant
      set({ loading: false });
      await playUrl(url, my);
    }
  } catch (e) {
    if (my !== session) return;
    if (!speechAvailable()) {
      set({ id: null, loading: false, notice: `Narration impossible : ${(e as Error).message}` });
      return;
    }
    if (useRelay) set({ notice: `Voix du conteur indisponible (${(e as Error).message}) : voix du navigateur utilisée.` });
    set({ loading: false });
    // Petits morceaux : certains navigateurs coupent les longues phrases au bout de ~15 s.
    await speakBrowser(splitForSpeech(clean, 220), my);
  }
  if (my === session) set({ id: null, loading: false });
}
