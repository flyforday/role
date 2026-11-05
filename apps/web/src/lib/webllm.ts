import type { LlmCall } from '@veillee/prompts';

/**
 * Mode local expérimental (phase 4) : le modèle tourne dans le navigateur via WebGPU, sans quota.
 * La bibliothèque est chargée à la demande depuis un CDN pour ne pas alourdir l'application.
 */
const WEBLLM_URL = 'https://esm.run/@mlc-ai/web-llm@0.2.86';

type Engine = {
  chat: {
    completions: {
      create(req: unknown): Promise<AsyncIterable<{ choices: Array<{ delta?: { content?: string } }> }>>;
    };
  };
};

/** Fenêtre de contexte demandée au modèle local (4 096 par défaut chez WebLLM : trop court pour le prompt du MJ). */
export const WEBLLM_CONTEXT_TOKENS = 16_384;
const MAX_OUTPUT_TOKENS = 1200;
/** Estimation prudente : ~3 caractères par jeton en français. */
const CHARS_PER_TOKEN = 3;

/**
 * Garde les messages système et les échanges les plus récents qui tiennent dans la fenêtre de contexte.
 * Le dernier message (l'action du joueur) est toujours conservé.
 */
export function fitToContext<T extends { role: string; content: string }>(messages: T[], contextTokens = WEBLLM_CONTEXT_TOKENS): T[] {
  const budget = (contextTokens - MAX_OUTPUT_TOKENS - 256) * CHARS_PER_TOKEN;
  const system = messages.filter((m) => m.role === 'system');
  const rest = messages.filter((m) => m.role !== 'system');
  let used = system.reduce((n, m) => n + m.content.length, 0);
  const kept: T[] = [];
  for (let i = rest.length - 1; i >= 0; i--) {
    const len = rest[i].content.length;
    if (kept.length > 0 && used + len > budget) break;
    used += len;
    kept.unshift(rest[i]);
  }
  return [...system, ...kept];
}

let enginePromise: Promise<Engine> | null = null;
let engineModel = '';
export let webllmProgress = '';

export function webGpuAvailable(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
}

async function getEngine(model: string): Promise<Engine> {
  if (enginePromise && engineModel === model) return enginePromise;
  if (!webGpuAvailable()) throw new Error("WebGPU n'est pas disponible dans ce navigateur (essayez Chrome ou Edge récents).");
  engineModel = model;
  enginePromise = (async () => {
    const mod = (await import(/* @vite-ignore */ WEBLLM_URL)) as {
      CreateMLCEngine: (
        m: string,
        o: { initProgressCallback: (p: { text: string }) => void },
        chat: { context_window_size: number },
      ) => Promise<Engine>;
    };
    return mod.CreateMLCEngine(model, { initProgressCallback: (p) => (webllmProgress = p.text) }, { context_window_size: WEBLLM_CONTEXT_TOKENS });
  })();
  enginePromise.catch(() => (enginePromise = null));
  return enginePromise;
}

export function webLlm(model: string): LlmCall {
  return async (messages, options) => {
    const engine = await getEngine(model);
    const stream = await engine.chat.completions.create({
      messages: fitToContext(messages),
      stream: true,
      temperature: options.purpose === 'summary' ? 0.3 : 0.8,
      max_tokens: MAX_OUTPUT_TOKENS,
      ...(options.json ? { response_format: { type: 'json_object' } } : {}),
    });
    let full = '';
    for await (const chunk of stream) {
      const t = chunk.choices[0]?.delta?.content ?? '';
      if (t) {
        full += t;
        options.onToken?.(t);
      }
    }
    return full;
  };
}
