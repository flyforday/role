import { ProviderError, type ChatMessage, type CompleteOptions, type LLMProvider } from './providers/types';

export interface FallbackResult {
  provider: LLMProvider;
  stream: ReadableStream<string>;
  /** Erreurs des fournisseurs essayés avant celui qui a répondu. */
  failures: string[];
}

/**
 * Essaie les fournisseurs dans l'ordre ; bascule sur le suivant en cas d'erreur 429, 5xx ou réseau.
 * Une erreur non récupérable (400, 401…) est aussi contournée, mais elle est signalée.
 */
export async function completeWithFallback(providers: LLMProvider[], messages: ChatMessage[], options: CompleteOptions): Promise<FallbackResult> {
  const failures: string[] = [];
  let lastError: ProviderError | null = null;
  for (const provider of providers) {
    try {
      const stream = await provider.complete(messages, options);
      return { provider, stream, failures };
    } catch (e) {
      const err = e instanceof ProviderError ? e : new ProviderError((e as Error).message, 0, provider.name);
      failures.push(`${provider.name}: ${err.status || 'réseau'}`);
      lastError = err;
    }
  }
  const status = lastError?.status && lastError.status !== 0 ? (lastError.retryable ? 503 : 502) : 503;
  throw new ProviderError(
    providers.length ? `Aucun fournisseur d'IA disponible (${failures.join(', ')})` : "Aucun fournisseur d'IA n'est configuré sur le relais",
    status,
    'relais',
  );
}
