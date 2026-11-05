import { mapJsonEvents, sseData } from '../sse';
import { fetchOrThrow, type ChatMessage, type CompleteOptions, type LLMProvider } from './types';

export interface OpenAICompatibleConfig {
  name: string;
  apiKey: string;
  model: string;
  baseUrl: string;
  extraHeaders?: Record<string, string>;
  /** Champs ajoutés au corps de la requête (réglages propres au fournisseur). */
  extraBody?: Record<string, unknown>;
}

/** Fournisseurs à l'API compatible OpenAI : Groq, OpenRouter, Mistral, Cerebras, NVIDIA… */
export class OpenAICompatibleProvider implements LLMProvider {
  readonly name: string;
  readonly model: string;

  constructor(private readonly config: OpenAICompatibleConfig) {
    this.name = config.name;
    this.model = config.model;
  }

  async complete(messages: ChatMessage[], options: CompleteOptions): Promise<ReadableStream<string>> {
    const res = await fetchOrThrow(this.name, `${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${this.config.apiKey}`,
        ...this.config.extraHeaders,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: true,
        temperature: options.temperature ?? 0.9,
        max_tokens: options.maxTokens ?? 1500,
        // Les modèles gpt-oss raisonnent avant de répondre : effort bas pour rester rapide.
        ...(this.model.includes('gpt-oss') ? { reasoning_effort: 'low' } : {}),
        ...this.config.extraBody,
      }),
      signal: options.signal,
    });
    return mapJsonEvents(sseData(res.body!), (json) => json?.choices?.[0]?.delta?.content);
  }
}

export function groq(apiKey: string, model: string): OpenAICompatibleProvider {
  return new OpenAICompatibleProvider({ name: 'groq', apiKey, model, baseUrl: 'https://api.groq.com/openai/v1' });
}

export function openrouter(apiKey: string, model: string): OpenAICompatibleProvider {
  return new OpenAICompatibleProvider({
    name: 'openrouter',
    apiKey,
    model,
    baseUrl: 'https://openrouter.ai/api/v1',
    extraHeaders: { 'HTTP-Referer': 'https://github.com/flyforday/role', 'X-Title': 'Veillee' },
  });
}

export function mistral(apiKey: string, model: string): OpenAICompatibleProvider {
  return new OpenAICompatibleProvider({ name: 'mistral', apiKey, model, baseUrl: 'https://api.mistral.ai/v1' });
}

export function cerebras(apiKey: string, model: string): OpenAICompatibleProvider {
  return new OpenAICompatibleProvider({ name: 'cerebras', apiKey, model, baseUrl: 'https://api.cerebras.ai/v1' });
}

export function nvidia(apiKey: string, model: string): OpenAICompatibleProvider {
  return new OpenAICompatibleProvider({ name: 'nvidia', apiKey, model, baseUrl: 'https://integrate.api.nvidia.com/v1' });
}

/** Cohere : clé d'essai gratuite sans carte (~1 000 appels/mois), via l'API compatible OpenAI. */
export function cohere(apiKey: string, model: string): OpenAICompatibleProvider {
  return new OpenAICompatibleProvider({ name: 'cohere', apiKey, model, baseUrl: 'https://api.cohere.ai/compatibility/v1' });
}

/** Z.ai (GLM) : modèles « flash » gratuits. La réflexion est coupée pour garder des réponses rapides. */
export function zai(apiKey: string, model: string): OpenAICompatibleProvider {
  return new OpenAICompatibleProvider({
    name: 'zai',
    apiKey,
    model,
    baseUrl: 'https://api.z.ai/api/paas/v4',
    extraBody: { thinking: { type: 'disabled' } },
  });
}
