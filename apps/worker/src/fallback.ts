import { ProviderError, type ChatMessage, type CompleteOptions, type LLMProvider } from './providers/types';

export interface FallbackResult {
  provider: LLMProvider;
  stream: ReadableStream<string>;
  /** Erreurs des fournisseurs essayés avant celui qui a répondu. */
  failures: string[];
}

/**
 * Modèles dont le quota est épuisé (429) : ils passent en fin de liste pendant un moment, pour ne pas
 * perdre un aller-retour à chaque tour. Mémoire propre à l'instance du Worker (remise à zéro au redémarrage).
 */
const exhausted = new Map<string, number>();
const DEFAULT_COOLDOWN_MS = 120_000;

export function resetQuotaMemory(): void {
  exhausted.clear();
}

const keyOf = (p: LLMProvider) => `${p.name}/${p.model}`;

/** Ordre d'essai : modèles disponibles d'abord, puis ceux en pause de quota (du plus ancien au plus récent). */
export function orderByQuota(providers: LLMProvider[], now = Date.now()): LLMProvider[] {
  const ready: LLMProvider[] = [];
  const cooling: Array<[LLMProvider, number]> = [];
  for (const p of providers) {
    const until = exhausted.get(keyOf(p));
    if (until !== undefined && until > now) cooling.push([p, until]);
    else {
      if (until !== undefined) exhausted.delete(keyOf(p));
      ready.push(p);
    }
  }
  return [...ready, ...cooling.sort((a, b) => a[1] - b[1]).map(([p]) => p)];
}

/**
 * Essaie les fournisseurs dans l'ordre ; bascule sur le suivant en cas d'erreur 429, 5xx ou réseau.
 * Une erreur non récupérable (400, 401…) est aussi contournée, mais elle est signalée.
 */
export async function completeWithFallback(
  providers: LLMProvider[],
  messages: ChatMessage[],
  options: CompleteOptions,
  cooldownMs = DEFAULT_COOLDOWN_MS,
): Promise<FallbackResult> {
  const failures: string[] = [];
  let lastError: ProviderError | null = null;
  for (const provider of orderByQuota(providers)) {
    try {
      const stream = await provider.complete(messages, options);
      exhausted.delete(keyOf(provider));
      return { provider, stream, failures };
    } catch (e) {
      const err = e instanceof ProviderError ? e : new ProviderError((e as Error).message, 0, provider.name);
      if (err.status === 429) exhausted.set(keyOf(provider), Date.now() + cooldownMs);
      failures.push(`${provider.name} ${provider.model}: ${err.status || 'réseau'}`);
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
