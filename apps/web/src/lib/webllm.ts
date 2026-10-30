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
      CreateMLCEngine: (m: string, o: { initProgressCallback: (p: { text: string }) => void }) => Promise<Engine>;
    };
    return mod.CreateMLCEngine(model, { initProgressCallback: (p) => (webllmProgress = p.text) });
  })();
  enginePromise.catch(() => (enginePromise = null));
  return enginePromise;
}

export function webLlm(model: string): LlmCall {
  return async (messages, options) => {
    const engine = await getEngine(model);
    const stream = await engine.chat.completions.create({
      messages,
      stream: true,
      temperature: options.purpose === 'summary' ? 0.3 : 0.8,
      max_tokens: 1200,
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
