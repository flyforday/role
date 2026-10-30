import { ABILITIES, type Abilities, type Character, type GameState, type Item } from './types';
import { makeId } from './ids';

export const MOD_MIN = -2;
export const MOD_MAX = 3;
/** Somme des modificateurs à répartir à la création. */
export const ABILITY_POINTS = 6;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampModifier(value: number): number {
  return clamp(Math.round(value), MOD_MIN, MOD_MAX);
}

export function abilityPointsUsed(abilities: Abilities): number {
  return ABILITIES.reduce((sum, a) => sum + abilities[a], 0);
}

export function validateAbilities(abilities: Abilities): string[] {
  const errors: string[] = [];
  for (const a of ABILITIES) {
    const v = abilities[a];
    if (!Number.isInteger(v) || v < MOD_MIN || v > MOD_MAX) {
      errors.push(`${a} doit être un entier entre ${MOD_MIN} et +${MOD_MAX}`);
    }
  }
  const used = abilityPointsUsed(abilities);
  if (used !== ABILITY_POINTS) {
    errors.push(`La somme des modificateurs doit valoir ${ABILITY_POINTS} (actuellement ${used})`);
  }
  return errors;
}

/** PV max : 10 + 2×Endurance au niveau 1, puis 5 + Endurance (min 1) par niveau. */
export function maxHpFor(level: number, endurance: number): number {
  const base = 10 + 2 * endurance;
  const perLevel = Math.max(1, 5 + endurance);
  return Math.max(1, base + (level - 1) * perLevel);
}

export function defenseFor(agilite: number, bonus = 0): number {
  return 10 + agilite + bonus;
}

/** XP totale requise pour atteindre un niveau : 50 × n × (n − 1). Niveau 2 = 100, 3 = 300, 4 = 600… */
export function xpForLevel(level: number): number {
  return 50 * level * (level - 1);
}

export const MAX_LEVEL = 10;

export function levelForXp(xp: number): number {
  let level = 1;
  while (level < MAX_LEVEL && xp >= xpForLevel(level + 1)) level++;
  return level;
}

export const STARTING_WEAPONS: Item[] = [
  { id: 'arme-epee', name: 'Épée courte', damage: '1d6+1', ability: 'force', description: 'Lame fiable et équilibrée.' },
  { id: 'arme-hache', name: 'Hache de bataille', damage: '1d8', ability: 'force', description: 'Lourde, brutale.' },
  { id: 'arme-dague', name: 'Paire de dagues', damage: '1d4+2', ability: 'agilite', description: 'Rapides et discrètes.' },
  { id: 'arme-arc', name: 'Arc court', damage: '1d6', ability: 'perception', description: 'Pour frapper de loin.' },
  { id: 'arme-baton', name: 'Bâton ferré', damage: '1d6', ability: 'intelligence', description: 'Canalise la volonté.' },
];

export const UNARMED: Item = { id: 'mains-nues', name: 'Mains nues', damage: '1d2', ability: 'force' };

export interface NewCharacterInput {
  name: string;
  concept: string;
  background: string;
  abilities: Abilities;
  weaponId?: string;
  playerId?: string;
  playerName?: string;
  id?: string;
}

export function createCharacter(input: NewCharacterInput): Character {
  const errors = validateAbilities(input.abilities);
  if (!input.name.trim()) errors.push('Le personnage doit avoir un nom');
  if (errors.length) throw new Error(errors.join(' ; '));
  const weapon = STARTING_WEAPONS.find((w) => w.id === input.weaponId) ?? STARTING_WEAPONS[0];
  const maxHp = maxHpFor(1, input.abilities.endurance);
  return {
    id: input.id ?? makeId('pj'),
    name: input.name.trim(),
    playerId: input.playerId,
    playerName: input.playerName,
    concept: input.concept.trim() || 'Aventurier',
    background: input.background.trim(),
    abilities: { ...input.abilities },
    level: 1,
    xp: 0,
    hp: maxHp,
    maxHp,
    defense: defenseFor(input.abilities.agilite),
    gold: 10,
    inventory: [
      { ...weapon, id: makeId('obj') },
      { id: makeId('obj'), name: 'Sac de voyage', description: 'Corde, briquet, rations pour trois jours.' },
      { id: makeId('obj'), name: 'Potion de soin', description: 'Rend 1d8+2 PV.', quantity: 1 },
    ],
    conditions: [],
    weapon: weapon.name,
  };
}

export function findItem(character: Character, name: string): Item | undefined {
  const n = normalize(name);
  return character.inventory.find((i) => normalize(i.name) === n);
}

export function weaponOf(character: Character): Item {
  if (character.weapon) {
    const w = findItem(character, character.weapon);
    if (w?.damage) return w;
  }
  return character.inventory.find((i) => i.damage) ?? UNARMED;
}

export function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function slugify(s: string): string {
  return (
    normalize(s)
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 48) || 'x'
  );
}

/** Accorde de l'XP et gère les montées de niveau. Modifie l'état passé en paramètre. */
export function grantXp(state: GameState, characterId: string, amount: number): string[] {
  const pc = state.characters.find((c) => c.id === characterId);
  if (!pc || amount <= 0) return [];
  const events: string[] = [];
  pc.xp += amount;
  const newLevel = levelForXp(pc.xp);
  if (newLevel > pc.level) {
    const oldMax = pc.maxHp;
    pc.level = newLevel;
    pc.maxHp = maxHpFor(newLevel, pc.abilities.endurance);
    pc.hp = Math.min(pc.maxHp, pc.hp + (pc.maxHp - oldMax));
    events.push(`${pc.name} atteint le niveau ${newLevel} (PV max ${pc.maxHp}).`);
  }
  return events;
}

