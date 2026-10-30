import type { ChatMessage, LlmCall, LlmCallOptions } from '@veillee/prompts';
import { getSettings, workerBase, type Settings } from './settings';
import { demoLlm } from './demo';
import { webLlm } from './webllm';

export class LlmError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/** Dernier fournisseur ayant répondu (affiché dans l'interface). */
export let lastProvider = '';

/** Crée la fonction d'appel au modèle selon les réglages du joueur. */
export function createLlm(gameId?: string, settings: Settings = getSettings()): LlmCall {
  if (settings.provider === 'demo') return demoLlm;
  if (settings.provider === 'webllm') return webLlm(settings.webllmModel);
  return (messages, options) => relay(messages, options, settings, gameId);
}

async function relay(messages: ChatMessage[], options: LlmCallOptions, settings: Settings, gameId?: string): Promise<string> {
  const byok =
    settings.provider === 'byok' && settings.byokKey
      ? { provider: settings.byokProvider, apiKey: settings.byokKey, model: settings.byokModel || undefined }
      : undefined;
  let res: Response;
  try {
    res = await fetch(`${workerBase(settings)}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        messages,
        json: options.json,
        gameId,
        byok,
        temperature: options.purpose === 'summary' ? 0.3 : 0.9,
        maxTokens: options.purpose === 'summary' ? 900 : options.purpose === 'world' ? 2000 : 1500,
      }),
      signal: options.signal,
    });
  } catch {
    throw new LlmError("Impossible de joindre le relais IA. Vérifiez l'adresse du Worker dans les réglages.", 0);
  }
  if (!res.ok || !res.body) {
    let msg = `Erreur ${res.status}`;
    try {
      msg = ((await res.json()) as { error?: string }).error ?? msg;
    } catch {
      // corps non JSON
    }
    throw new LlmError(msg, res.status);
  }
  lastProvider = res.headers.get('x-provider') ?? '';
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) {
      full += chunk;
      options.onToken?.(chunk);
    }
  }
  return full;
}
