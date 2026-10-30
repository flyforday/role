import { createCharacter } from './rules';
import type { Character, GameState } from './types';

const PRESETS = [
  {
    name: 'Brunehilde',
    concept: 'Guerrière au grand cœur',
    background: "Mercenaire bourrue qui a rejoint le groupe pour la paie et reste par amitié. Se jette toujours en première ligne.",
    abilities: { force: 2, agilite: 1, endurance: 2, intelligence: 0, perception: 1, charisme: 0 },
    weaponId: 'arme-epee',
  },
  {
    name: 'Fenouil',
    concept: 'Éclaireur halfelin',
    background: 'Chapardeur repenti, bavard et curieux, qui voit tout et tire juste.',
    abilities: { force: 0, agilite: 2, endurance: 1, intelligence: 0, perception: 2, charisme: 1 },
    weaponId: 'arme-arc',
  },
  {
    name: 'Sœur Agathe',
    concept: 'Prêtresse itinérante',
    background: 'Guérisseuse calme et lettrée, qui connaît les légendes et les herbes.',
    abilities: { force: 1, agilite: 0, endurance: 2, intelligence: 2, perception: 1, charisme: 0 },
    weaponId: 'arme-baton',
  },
] as const;

export const MAX_COMPANIONS = PRESETS.length;

/** Compagnons PNJ prêts à jouer, que le MJ incarne pour étoffer un petit groupe. */
export function makeCompanions(count: number): Character[] {
  return PRESETS.slice(0, Math.max(0, Math.min(count, PRESETS.length))).map((p, i) => ({
    ...createCharacter({ ...p, abilities: { ...p.abilities }, id: `compagnon-${i + 1}` }),
    companion: true,
  }));
}

/** Ajoute des compagnons à une partie (sans doublon). */
export function addCompanions(input: GameState, count: number): GameState {
  const state = structuredClone(input);
  for (const c of makeCompanions(count)) if (!state.characters.some((x) => x.id === c.id)) state.characters.push(c);
  return state;
}
