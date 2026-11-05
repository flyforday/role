import { mapJsonEvents, sseData } from '../sse';
import { ProviderError, type ChatMessage, type CompleteOptions, type LLMProvider } from './types';

/** Partie de la liaison Workers AI (`[ai] binding = "AI"`) utilisée par le relais. */
export interface WorkersAiBinding {
  run(model: string, inputs: Record<string, unknown>): Promise<unknown>;
}

/**
 * Cloudflare Workers AI, appelé par la liaison du Worker : aucune clé à créer,
 * 10 000 « neurones » gratuits par jour sur le compte. Sert de dernier secours.
 */
export class WorkersAiProvider implements LLMProvider {
  readonly name = 'cloudflare';

  constructor(
    private readonly ai: WorkersAiBinding,
    readonly model: string,
  ) {}

  async complete(messages: ChatMessage[], options: CompleteOptions): Promise<ReadableStream<string>> {
    let out: unknown;
    try {
      out = await this.ai.run(this.model, {
        messages,
        stream: true,
        max_tokens: options.maxTokens ?? 1500,
        temperature: Math.min(options.temperature ?? 0.9, 1.5),
      });
    } catch (e) {
      const msg = (e as Error).message ?? String(e);
      // 4006 : allocation gratuite du jour épuisée ; 3040 : capacité ; 5007 : modèle inconnu.
      const status = /4006|neurons|allocation|capacity|3040|rate/i.test(msg) ? 429 : /5007|no such model|not found/i.test(msg) ? 404 : 500;
      throw new ProviderError(`cloudflare a répondu ${status} : ${msg.slice(0, 300)}`, status, this.name);
    }
    if (!(out instanceof ReadableStream)) throw new ProviderError('cloudflare : réponse inattendue (pas de flux)', 502, this.name);
    return mapJsonEvents(sseData(out as ReadableStream<Uint8Array>), (json) => json?.response ?? json?.choices?.[0]?.delta?.content);
  }
}
