import type { Campaign, Character, GameState, LogEntry, LoreEntry, Location, Npc, Quest } from './types';
import { makeId } from './ids';
import { slugify } from './rules';

export interface NewGameInput {
  campaign: Campaign;
  startingLocation: { name: string; description?: string };
  npcs?: Array<Omit<Npc, 'id' | 'status'> & { id?: string; status?: Npc['status'] }>;
  quests?: Array<Omit<Quest, 'id' | 'status' | 'clues'> & { id?: string; clues?: string[] }>;
  lore?: Array<Omit<LoreEntry, 'id'>>;
  characters?: Character[];
  id?: string;
  now?: string;
}

export function createGameState(input: NewGameInput): GameState {
  const now = input.now ?? new Date().toISOString();
  const start: Location = { id: slugify(input.startingLocation.name), ...input.startingLocation };
  return {
    version: 1,
    id: input.id ?? makeId('partie'),
    createdAt: now,
    updatedAt: now,
    campaign: input.campaign,
    characters: input.characters ?? [],
    npcs: (input.npcs ?? []).map((n) => ({
      ...n,
      id: n.id ? slugify(n.id) : slugify(n.name),
      status: n.status ?? 'vivant',
      locationId: n.locationId ?? start.id,
    })),
    locations: [start],
    currentLocationId: start.id,
    quests: (input.quests ?? []).map((q) => ({ ...q, id: q.id ? slugify(q.id) : slugify(q.title), status: 'active', clues: q.clues ?? [] })),
    flags: {},
    summary: '',
    summarizedThroughTurn: 0,
    lore: (input.lore ?? []).map((l) => ({ ...l, id: makeId('lore') })),
    log: [],
    memoryNotes: [],
    pendingRejections: [],
    suggestedActions: [],
    combat: null,
    turn: 0,
    turnMode: 'libre',
  };
}

export function addLog(state: GameState, entry: Omit<LogEntry, 'id' | 'at' | 'turn'> & { turn?: number }): LogEntry {
  const full: LogEntry = { id: makeId('log'), at: new Date().toISOString(), turn: entry.turn ?? state.turn, ...entry };
  state.log.push(full);
  return full;
}

export function currentLocation(state: GameState): Location | undefined {
  return state.locations.find((l) => l.id === state.currentLocationId);
}

export function npcsHere(state: GameState): Npc[] {
  return state.npcs.filter((n) => n.status === 'vivant' && (!n.locationId || n.locationId === state.currentLocationId));
}

export function addCharacter(input: GameState, character: Character): GameState {
  const state = structuredClone(input);
  if (state.characters.some((c) => c.id === character.id)) {
    state.characters = state.characters.map((c) => (c.id === character.id ? character : c));
  } else {
    state.characters.push(character);
  }
  return state;
}
