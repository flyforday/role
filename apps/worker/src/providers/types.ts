export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface CompleteOptions {
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

/** Interface commune à tous les fournisseurs d'IA. Le flux renvoyé ne contient que le texte généré. */
export interface LLMProvider {
  readonly name: string;
  readonly model: string;
  complete(messages: ChatMessage[], options: CompleteOptions): Promise<ReadableStream<string>>;
}

/** Erreur levée avant le début du flux ; `retryable` déclenche la bascule vers le fournisseur suivant. */
export class ProviderError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly provider: string,
  ) {
    super(message);
  }

  get retryable(): boolean {
    return this.status === 429 || this.status >= 500 || this.status === 0;
  }
}

/** Délai maximal avant les en-têtes de réponse : au-delà, on bascule plutôt que d'attendre un 524. */
export const HEADER_TIMEOUT_MS = 40_000;

export async function fetchOrThrow(provider: string, url: string, init: RequestInit, timeoutMs = HEADER_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const outer = init.signal;
  const onAbort = () => controller.abort(outer?.reason);
  if (outer?.aborted) controller.abort(outer.reason);
  else outer?.addEventListener('abort', onAbort, { once: true });
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  let res: Response;
  try {
    res = await fetch(url, { ...init, signal: controller.signal });
  } catch (e) {
    if (timedOut) throw new ProviderError(`${provider} trop lent (aucune réponse après ${Math.round(timeoutMs / 1000)} s)`, 504, provider);
    throw new ProviderError(`${provider} injoignable : ${(e as Error).message}`, 0, provider);
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok || !res.body) {
    outer?.removeEventListener('abort', onAbort);
    const detail = (await res.text().catch(() => '')).slice(0, 300);
    throw new ProviderError(`${provider} a répondu ${res.status} : ${detail}`, res.status, provider);
  }
  return res;
}
