import type { Env } from '../env';
import { GeminiProvider } from './gemini';
import { groq, openrouter } from './openai-compatible';
import type { LLMProvider } from './types';

export const PROVIDER_NAMES = ['gemini', 'groq', 'openrouter'] as const;
export type ProviderName = (typeof PROVIDER_NAMES)[number];

export const DEFAULT_MODELS: Record<ProviderName, string> = {
  gemini: 'gemini-flash-latest',
  groq: 'llama-3.3-70b-versatile',
  openrouter: 'meta-llama/llama-3.3-70b-instruct:free',
};

export function makeProvider(name: ProviderName, apiKey: string, model: string, env: Env = {}): LLMProvider {
  switch (name) {
    case 'gemini': {
      const budget = env.GEMINI_THINKING_BUDGET;
      return new GeminiProvider({ apiKey, model, thinkingBudget: budget !== undefined && budget !== '' ? Number(budget) : undefined });
    }
    case 'groq':
      return groq(apiKey, model);
    case 'openrouter':
      return openrouter(apiKey, model);
  }
}

/** Fournisseurs partagés configurés dans le Worker, dans l'ordre de bascule. */
export function configuredProviders(env: Env): LLMProvider[] {
  const order = (env.PROVIDER_ORDER ?? PROVIDER_NAMES.join(','))
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is ProviderName => (PROVIDER_NAMES as readonly string[]).includes(s));
  const keys: Record<ProviderName, string | undefined> = {
    gemini: env.GEMINI_API_KEY,
    groq: env.GROQ_API_KEY,
    openrouter: env.OPENROUTER_API_KEY,
  };
  const models: Record<ProviderName, string | undefined> = {
    gemini: env.GEMINI_MODEL,
    groq: env.GROQ_MODEL,
    openrouter: env.OPENROUTER_MODEL,
  };
  return [...new Set(order)]
    .filter((name) => keys[name])
    .map((name) => makeProvider(name, keys[name]!, models[name] || DEFAULT_MODELS[name], env));
}
