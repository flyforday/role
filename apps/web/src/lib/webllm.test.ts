import { describe, expect, it } from 'vitest';
import { fitToContext } from './webllm';

describe('modèle local : fenêtre de contexte', () => {
  it('garde tout quand ça tient', () => {
    const msgs = [
      { role: 'system', content: 'MJ' },
      { role: 'user', content: 'a' },
      { role: 'assistant', content: 'b' },
    ];
    expect(fitToContext(msgs)).toEqual(msgs);
  });

  it('retire les échanges les plus anciens mais garde le système et la dernière action', () => {
    const long = 'x'.repeat(10_000);
    const msgs = [
      { role: 'system', content: 'MJ' },
      { role: 'user', content: `ancien ${long}` },
      { role: 'assistant', content: `ancien ${long}` },
      { role: 'user', content: `récent ${long}` },
      { role: 'assistant', content: `récent ${long}` },
      { role: 'user', content: 'Je frappe à la porte.' },
    ];
    const out = fitToContext(msgs, 8192);
    expect(out[0].content).toBe('MJ');
    expect(out[out.length - 1].content).toBe('Je frappe à la porte.');
    expect(out.some((m) => m.content.startsWith('ancien'))).toBe(false);
    expect(out.reduce((n, m) => n + m.content.length, 0)).toBeLessThanOrEqual((8192 - 1200 - 256) * 3);
  });
});
