import type { Env } from '../env';
import { GeminiProvider } from './gemini';
import { cerebras, groq, mistral, nvidia, openrouter } from './openai-compatible';
import type { LLMProvider } from './types';
import { WorkersAiProvider } from './workers-ai';

/** Tous les fournisseurs du relais, dans l'ordre de bascule par défaut. */
export const PROVIDER_NAMES = ['gemini', 'groq', 'mistral', 'cerebras', 'openrouter', 'nvidia', 'cloudflare'] as const;
export type ProviderName = (typeof PROVIDER_NAMES)[number];

/** Fournisseurs utilisables avec une clé personnelle (Workers AI passe par la liaison du Worker, sans clé). */
export const BYOK_PROVIDERS = ['gemini', 'groq', 'mistral', 'cerebras', 'openrouter', 'nvidia'] as const;
export type ByokProviderName = (typeof BYOK_PROVIDERS)[number];

export const DEFAULT_MODELS: Record<ProviderName, string> = {
  gemini: 'gemini-flash-latest',
  groq: 'openai/gpt-oss-120b',
  mistral: 'mistral-medium-latest',
  cerebras: 'gpt-oss-120b',
  openrouter: 'meta-llama/llama-3.3-70b-instruct:free',
  nvidia: 'meta/llama-3.3-70b-instruct',
  cloudflare: '@cf/meta/llama-3.3-70b-instruct-fp8-fast,@cf/mistralai/mistral-small-3.1-24b-instruct',
};

export function makeProvider(name: ByokProviderName, apiKey: string, model: string, env: Env = {}): LLMProvider {
  switch (name) {
    case 'gemini': {
      const budget = env.GEMINI_THINKING_BUDGET;
      return new GeminiProvider({
        apiKey,
        model,
        thinkingLevel: env.GEMINI_THINKING_LEVEL || undefined,
        thinkingBudget: budget !== undefined && budget !== '' ? Number(budget) : undefined,
      });
    }
    case 'groq':
      return groq(apiKey, model);
    case 'mistral':
      return mistral(apiKey, model);
    case 'cerebras':
      return cerebras(apiKey, model);
    case 'openrouter':
      return openrouter(apiKey, model);
    case 'nvidia':
      return nvidia(apiKey, model);
  }
}

/** Fournisseurs partagés configurés dans le Worker, dans l'ordre de bascule. Ceux sans clé sont ignorés. */
export function configuredProviders(env: Env): LLMProvider[] {
  const order = (env.PROVIDER_ORDER ?? PROVIDER_NAMES.join(','))
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is ProviderName => (PROVIDER_NAMES as readonly string[]).includes(s));
  const keys: Record<ByokProviderName, string | undefined> = {
    gemini: env.GEMINI_API_KEY,
    groq: env.GROQ_API_KEY,
    mistral: env.MISTRAL_API_KEY,
    cerebras: env.CEREBRAS_API_KEY,
    openrouter: env.OPENROUTER_API_KEY,
    nvidia: env.NVIDIA_API_KEY,
  };
  const models: Record<ProviderName, string | undefined> = {
    gemini: env.GEMINI_MODEL,
    groq: env.GROQ_MODEL,
    mistral: env.MISTRAL_MODEL,
    cerebras: env.CEREBRAS_MODEL,
    openrouter: env.OPENROUTER_MODEL,
    nvidia: env.NVIDIA_MODEL,
    cloudflare: env.CLOUDFLARE_AI_MODEL,
  };
  const modelList = (name: ProviderName) => (models[name] || DEFAULT_MODELS[name]).split(',').map((m) => m.trim()).filter(Boolean);
  // Un même fournisseur peut lister plusieurs modèles (« a,b ») : on bascule de l'un à l'autre.
  return [...new Set(order)].flatMap((name): LLMProvider[] => {
    if (name === 'cloudflare') return env.AI ? modelList(name).map((m) => new WorkersAiProvider(env.AI!, m)) : [];
    const key = keys[name];
    return key ? modelList(name).map((m) => makeProvider(name, key, m, env)) : [];
  });
}
