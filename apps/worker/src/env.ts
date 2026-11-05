import type { WorkersAiBinding } from './providers/workers-ai';

export interface Env {
  /** Cloudflare Workers AI (liaison « AI », sans clé). */
  AI?: WorkersAiBinding;
  CLOUDFLARE_AI_MODEL?: string;
  /** Salles multijoueur (Durable Object « Salle »). */
  SALLES?: DurableObjectNamespace;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  GEMINI_THINKING_BUDGET?: string;
  GEMINI_THINKING_LEVEL?: string;
  GROQ_API_KEY?: string;
  GROQ_MODEL?: string;
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL?: string;
  MISTRAL_API_KEY?: string;
  MISTRAL_MODEL?: string;
  CEREBRAS_API_KEY?: string;
  CEREBRAS_MODEL?: string;
  NVIDIA_API_KEY?: string;
  NVIDIA_MODEL?: string;
  /** Durée (s) pendant laquelle un modèle qui a répondu 429 est essayé en dernier. */
  QUOTA_COOLDOWN_S?: string;
  PROVIDER_ORDER?: string;
  ALLOWED_ORIGINS?: string;
  RATE_LIMIT_PER_IP_PER_MIN?: string;
  RATE_LIMIT_PER_GAME_PER_MIN?: string;
  RATE_LIMIT_PER_IP_PER_DAY?: string;
  MAX_OUTPUT_TOKENS?: string;
  GEMINI_TTS_MODEL?: string;
  GEMINI_TTS_VOICE?: string;
  TTS_PER_IP_PER_DAY?: string;
  TTS_TIMEOUT_MS?: string;
}

export function intVar(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}
