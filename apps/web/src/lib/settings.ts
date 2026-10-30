import { useSyncExternalStore } from 'react';

export type ProviderChoice = 'relais' | 'byok' | 'webllm' | 'demo';
export type ByokProvider = 'gemini' | 'groq' | 'openrouter';

export interface Settings {
  provider: ProviderChoice;
  /** Clé personnelle : stockée uniquement dans ce navigateur, envoyée au relais à chaque requête. */
  byokProvider: ByokProvider;
  byokKey: string;
  byokModel: string;
  webllmModel: string;
  /** Remplace VITE_WORKER_URL si renseigné. */
  workerUrl: string;
  displayName: string;
}

const KEY = 'veillee:reglages';

export const DEFAULT_SETTINGS: Settings = {
  provider: 'relais',
  byokProvider: 'gemini',
  byokKey: '',
  byokModel: '',
  webllmModel: 'Qwen2.5-3B-Instruct-q4f16_1-MLC',
  workerUrl: '',
  displayName: '',
};

let current: Settings = load();
const listeners = new Set<() => void>();

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function getSettings(): Settings {
  return current;
}

export function saveSettings(patch: Partial<Settings>) {
  current = { ...current, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    // stockage indisponible (navigation privée) : réglages gardés en mémoire
  }
  listeners.forEach((l) => l());
}

export function useSettings(): Settings {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
  );
}

export function workerBase(settings: Settings = current): string {
  return (settings.workerUrl || import.meta.env.VITE_WORKER_URL || '').replace(/\/+$/, '');
}
