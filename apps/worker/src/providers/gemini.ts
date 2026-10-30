import { mapJsonEvents, sseData } from '../sse';
import { fetchOrThrow, ProviderError, type ChatMessage, type CompleteOptions, type LLMProvider } from './types';

export interface GeminiConfig {
  apiKey: string;
  model: string;
  thinkingBudget?: number;
  /** Niveau de réflexion des modèles Gemini 3 (minimal, low, medium, high). Prioritaire sur thinkingBudget. */
  thinkingLevel?: string;
  baseUrl?: string;
}

export class GeminiProvider implements LLMProvider {
  readonly name = 'gemini';
  readonly model: string;

  constructor(private readonly config: GeminiConfig) {
    this.model = config.model;
  }

  async complete(messages: ChatMessage[], options: CompleteOptions): Promise<ReadableStream<string>> {
    const base = this.config.baseUrl ?? 'https://generativelanguage.googleapis.com/v1beta';
    const url = `${base}/models/${encodeURIComponent(this.model)}:streamGenerateContent?alt=sse`;
    const system = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n');
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    for (const m of messages) {
      if (m.role === 'system') continue;
      const role = m.role === 'assistant' ? 'model' : 'user';
      const last = contents[contents.length - 1];
      if (last && last.role === role) last.parts.push({ text: m.content });
      else contents.push({ role, parts: [{ text: m.content }] });
    }
    const generationConfig: Record<string, unknown> = {
      temperature: options.temperature ?? 0.9,
      maxOutputTokens: options.maxTokens ?? 1500,
    };
    if (options.json) generationConfig.responseMimeType = 'application/json';
    const thinkingConfig = this.config.thinkingLevel
      ? { thinkingLevel: this.config.thinkingLevel }
      : this.config.thinkingBudget !== undefined
        ? { thinkingBudget: this.config.thinkingBudget }
        : undefined;

    const send = (withThinking: boolean) =>
      fetchOrThrow(this.name, url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': this.config.apiKey },
        body: JSON.stringify({
          ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
          contents,
          generationConfig: withThinking && thinkingConfig ? { ...generationConfig, thinkingConfig } : generationConfig,
        }),
        signal: options.signal,
      });

    let res: Response;
    try {
      res = await send(true);
    } catch (e) {
      // Un modèle qui ne connaît pas ce réglage de réflexion répond 400 : on réessaie sans.
      if (!(thinkingConfig && e instanceof ProviderError && e.status === 400 && /thinking/i.test(e.message))) throw e;
      res = await send(false);
    }
    return mapJsonEvents(sseData(res.body!), (json) =>
      (json?.candidates?.[0]?.content?.parts ?? [])
        .filter((p: { thought?: boolean }) => !p.thought)
        .map((p: { text?: string }) => p.text ?? '')
        .join(''),
    );
  }
}
