import { createCharacter } from './rules';
import { createGameState } from './state';
import type { GameState } from './types';

export function sampleState(): GameState {
  const hero = createCharacter({
    id: 'pj_lyra',
    name: 'Lyra',
    concept: 'Éclaireuse',
    background: 'Ancienne contrebandière.',
    abilities: { force: 0, agilite: 3, endurance: 1, intelligence: 0, perception: 2, charisme: 0 },
    weaponId: 'arme-dague',
  });
  const state = createGameState({
    id: 'partie_test',
    now: '2026-01-01T00:00:00.000Z',
    campaign: {
      title: 'Les Brumes de Varenne',
      genre: 'Fantasy',
      tone: 'Sombre',
      setting: 'Un port noyé de brume.',
      pitch: 'Des navires disparaissent.',
      lines: ['violence envers les enfants'],
      veils: ['torture'],
    },
    startingLocation: { name: 'Quai aux Lanternes', description: 'Pavés humides.' },
    npcs: [{ id: 'marek', name: 'Marek', description: 'Capitaine du port', attitude: 'méfiant', hp: 8, maxHp: 10, secrets: ['Payé par les passeurs'] }],
    quests: [{ id: 'navires', title: 'Les navires disparus', objective: 'Comprendre où vont les navires' }],
    characters: [hero],
  });
  return state;
}
