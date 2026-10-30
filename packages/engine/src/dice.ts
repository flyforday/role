import type { Ability, RollResult } from './types';

/** Générateur aléatoire injectable : renvoie un nombre dans [0, 1). */
export type Rng = () => number;

/** Générateur déterministe (mulberry32) pour les tests et les rejouages. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Générateur par défaut, basé sur crypto quand il est disponible. */
export const defaultRng: Rng = () => {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c?.getRandomValues) {
    const buf = new Uint32Array(1);
    c.getRandomValues(buf);
    return buf[0] / 4294967296;
  }
  return Math.random();
};

export function rollDie(sides: number, rng: Rng): number {
  if (!Number.isInteger(sides) || sides < 1) throw new Error(`Dé invalide : d${sides}`);
  return Math.floor(rng() * sides) + 1;
}

export interface DiceExpr {
  count: number;
  sides: number;
  bonus: number;
}

const DICE_RE = /^\s*(\d*)\s*d\s*(\d+)\s*(?:([+-])\s*(\d+))?\s*$/i;

/** Analyse une expression du type "2d6+1", "d8", "1d4-1". */
export function parseDice(expr: string): DiceExpr | null {
  const m = DICE_RE.exec(expr);
  if (!m) return null;
  const count = m[1] ? Number(m[1]) : 1;
  const sides = Number(m[2]);
  const bonus = m[3] ? (m[3] === '-' ? -1 : 1) * Number(m[4]) : 0;
  if (count < 1 || count > 20 || sides < 2 || sides > 100) return null;
  return { count, sides, bonus };
}

export interface DiceRoll {
  expr: string;
  rolls: number[];
  bonus: number;
  total: number;
}

export function rollDice(expr: string, rng: Rng, options: { doubleDice?: boolean } = {}): DiceRoll {
  const parsed = parseDice(expr);
  if (!parsed) throw new Error(`Expression de dés invalide : ${expr}`);
  const count = options.doubleDice ? parsed.count * 2 : parsed.count;
  const rolls = Array.from({ length: count }, () => rollDie(parsed.sides, rng));
  const total = rolls.reduce((a, b) => a + b, 0) + parsed.bonus;
  return { expr, rolls, bonus: parsed.bonus, total };
}

export interface CheckInput {
  characterId: string;
  ability: Ability;
  modifier: number;
  difficulty: number;
  reason: string;
}

/** Jet de test : 1d20 + modificateur ≥ difficulté. 20 naturel réussit toujours, 1 naturel échoue toujours. */
export function abilityCheck(input: CheckInput, rng: Rng): RollResult {
  const natural = rollDie(20, rng);
  const total = natural + input.modifier;
  const critical = natural === 20 ? 'réussite' : natural === 1 ? 'échec' : null;
  const success = critical === 'réussite' ? true : critical === 'échec' ? false : total >= input.difficulty;
  return {
    characterId: input.characterId,
    ability: input.ability,
    difficulty: input.difficulty,
    natural,
    modifier: input.modifier,
    total,
    success,
    critical,
    reason: input.reason,
  };
}
