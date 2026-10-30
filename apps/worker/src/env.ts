export interface Env {
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  GEMINI_THINKING_BUDGET?: string;
  GEMINI_THINKING_LEVEL?: string;
  GROQ_API_KEY?: string;
  GROQ_MODEL?: string;
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL?: string;
  PROVIDER_ORDER?: string;
  ALLOWED_ORIGINS?: string;
  RATE_LIMIT_PER_IP_PER_MIN?: string;
  RATE_LIMIT_PER_GAME_PER_MIN?: string;
  RATE_LIMIT_PER_IP_PER_DAY?: string;
  MAX_OUTPUT_TOKENS?: string;
}

export function intVar(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}
