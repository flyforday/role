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

export async function fetchOrThrow(provider: string, url: string, init: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (e) {
    throw new ProviderError(`${provider} injoignable : ${(e as Error).message}`, 0, provider);
  }
  if (!res.ok || !res.body) {
    const detail = (await res.text().catch(() => '')).slice(0, 300);
    throw new ProviderError(`${provider} a répondu ${res.status} : ${detail}`, res.status, provider);
  }
  return res;
}
