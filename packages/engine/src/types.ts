/** Types du moteur de jeu. Tout ce qui est ici est sérialisable en JSON. */

import type { ScenarioState } from './scenario';

export const ABILITIES = ['force', 'agilite', 'endurance', 'intelligence', 'perception', 'charisme'] as const;
export type Ability = (typeof ABILITIES)[number];

export const ABILITY_LABELS: Record<Ability, string> = {
  force: 'Force',
  agilite: 'Agilité',
  endurance: 'Endurance',
  intelligence: 'Intelligence',
  perception: 'Perception',
  charisme: 'Charisme',
};

export const DIFFICULTIES = [8, 12, 16, 20] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  8: 'Facile',
  12: 'Moyen',
  16: 'Difficile',
  20: 'Héroïque',
};

export type Abilities = Record<Ability, number>;

export interface Item {
  id: string;
  name: string;
  description?: string;
  /** Dés de dégâts si l'objet est une arme, ex. "1d8". */
  damage?: string;
  /** Caractéristique utilisée pour attaquer avec cette arme. */
  ability?: Ability;
  quantity?: number;
}

export interface Character {
  id: string;
  name: string;
  /** Identifiant du joueur (compte Supabase) qui contrôle ce PJ, absent en solo. */
  playerId?: string;
  playerName?: string;
  concept: string;
  background: string;
  abilities: Abilities;
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  defense: number;
  gold: number;
  inventory: Item[];
  conditions: string[];
  /** Nom de l'objet utilisé comme arme principale. */
  weapon?: string;
}

export type NpcStatus = 'vivant' | 'mort';

export interface Npc {
  id: string;
  name: string;
  description?: string;
  attitude?: string;
  status: NpcStatus;
  /** Secrets connus du MJ uniquement. */
  secrets?: string[];
  locationId?: string;
  hp?: number;
  maxHp?: number;
  conditions?: string[];
}

export interface Location {
  id: string;
  name: string;
  description?: string;
}

export type QuestStatus = 'active' | 'réussie' | 'échouée';

export interface Quest {
  id: string;
  title: string;
  objective?: string;
  status: QuestStatus;
  clues: string[];
}

export interface LoreEntry {
  id: string;
  keywords: string[];
  text: string;
}

export interface Campaign {
  title: string;
  genre: string;
  tone: string;
  setting: string;
  pitch: string;
  /** Thèmes interdits. */
  lines: string[];
  /** Thèmes traités hors champ. */
  veils: string[];
  specialRules?: string;
}

export interface RollResult {
  characterId: string;
  ability: Ability;
  difficulty: number;
  natural: number;
  modifier: number;
  total: number;
  success: boolean;
  critical: 'réussite' | 'échec' | null;
  reason: string;
}

export type LogKind = 'player' | 'gm' | 'roll' | 'combat' | 'system';

export interface LogEntry {
  id: string;
  turn: number;
  at: string;
  kind: LogKind;
  /** Id du personnage pour une action de joueur. */
  actorId?: string;
  actorName?: string;
  text: string;
  roll?: RollResult;
}

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  /** Bonus d'attaque ajouté au d20. */
  attack: number;
  defense: number;
  /** Dés de dégâts, ex. "1d6+1". */
  damage: string;
  /** Bonus d'initiative. */
  initiative: number;
  xp: number;
}

export interface CombatantRef {
  id: string;
  kind: 'pc' | 'enemy';
  initiative: number;
}

export interface CombatState {
  round: number;
  order: CombatantRef[];
  enemies: Enemy[];
}

export type FlagValue = string | number | boolean;

export type TurnMode = 'libre' | 'tour';

export interface GameState {
  version: 1;
  id: string;
  createdAt: string;
  updatedAt: string;
  campaign: Campaign;
  characters: Character[];
  npcs: Npc[];
  locations: Location[];
  currentLocationId: string | null;
  quests: Quest[];
  flags: Record<string, FlagValue>;
  /** Résumé glissant de l'histoire. */
  summary: string;
  /** Numéro du dernier tour intégré au résumé. */
  summarizedThroughTurn: number;
  lore: LoreEntry[];
  log: LogEntry[];
  /** Faits importants notés par le MJ. */
  memoryNotes: string[];
  /** Changements refusés au dernier tour, à signaler au MJ. */
  pendingRejections: string[];
  suggestedActions: string[];
  combat: CombatState | null;
  turn: number;
  turnMode: TurnMode;
  /** Scénario prêt à jouer suivi par le MJ (absent pour un monde généré). */
  scenario?: ScenarioState;
}
