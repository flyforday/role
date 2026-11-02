import { describe, expect, it } from 'vitest';
import { cleanForSpeech, splitForSpeech } from './narration';

describe('narration', () => {
  it('retire la mise en forme', () => {
    expect(cleanForSpeech('**Attention** : le _gobelin_ attaque !\n\n\nFuyez.')).toBe('Attention : le gobelin attaque !\nFuyez.');
  });
  it('découpe aux fins de phrase sans dépasser la limite', () => {
    const text = 'Une phrase courte. '.repeat(30).trim();
    const parts = splitForSpeech(text, 100);
    expect(parts.length).toBeGreaterThan(1);
    expect(parts.every((p) => p.length <= 100)).toBe(true);
    expect(parts.join(' ')).toBe(text);
  });
  it('coupe un bloc sans ponctuation trop long', () => {
    expect(splitForSpeech('a'.repeat(250), 100).map((p) => p.length)).toEqual([100, 100, 50]);
  });
});
