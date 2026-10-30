import { describe, expect, it } from 'vitest';
import { abilityCheck, parseDice, rollDice, rollDie, seededRng } from './dice';

const fixed = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe('dés', () => {
  it('est déterministe avec une graine', () => {
    const a = seededRng(42);
    const b = seededRng(42);
    const ra = Array.from({ length: 10 }, () => rollDie(20, a));
    const rb = Array.from({ length: 10 }, () => rollDie(20, b));
    expect(ra).toEqual(rb);
    expect(ra.every((v) => v >= 1 && v <= 20)).toBe(true);
  });

  it('couvre toutes les faces', () => {
    const rng = seededRng(1);
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) seen.add(rollDie(20, rng));
    expect(seen.size).toBe(20);
  });

  it('analyse les expressions', () => {
    expect(parseDice('2d6+1')).toEqual({ count: 2, sides: 6, bonus: 1 });
    expect(parseDice('d8')).toEqual({ count: 1, sides: 8, bonus: 0 });
    expect(parseDice('1d4 - 1')).toEqual({ count: 1, sides: 4, bonus: -1 });
    expect(parseDice('abc')).toBeNull();
    expect(parseDice('100d6')).toBeNull();
  });

  it('lance une expression et double les dés en critique', () => {
    const r = rollDice('2d6+1', fixed(0, 0.99));
    expect(r.rolls).toEqual([1, 6]);
    expect(r.total).toBe(8);
    expect(rollDice('1d6', fixed(0.5), { doubleDice: true }).rolls).toHaveLength(2);
  });

  it('applique 1d20 + mod ≥ difficulté', () => {
    const base = { characterId: 'x', ability: 'force' as const, modifier: 2, difficulty: 12, reason: 'test' };
    expect(abilityCheck(base, fixed(0.5)).total).toBe(13); // 11 + 2
    expect(abilityCheck(base, fixed(0.5)).success).toBe(true);
    expect(abilityCheck(base, fixed(0.4)).success).toBe(false); // 9 + 2
  });

  it('gère les critiques', () => {
    const base = { characterId: 'x', ability: 'force' as const, modifier: -2, difficulty: 20, reason: 'test' };
    const crit = abilityCheck(base, fixed(0.999));
    expect(crit.natural).toBe(20);
    expect(crit.success).toBe(true);
    expect(crit.critical).toBe('réussite');
    const fumble = abilityCheck({ ...base, modifier: 30, difficulty: 8 }, fixed(0));
    expect(fumble.natural).toBe(1);
    expect(fumble.success).toBe(false);
    expect(fumble.critical).toBe('échec');
  });
});
