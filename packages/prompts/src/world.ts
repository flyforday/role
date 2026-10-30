import { createGameState, type Campaign, type GameState } from '@veillee/engine';
import type { ChatMessage } from './context';
import { WORLD_SYSTEM_PROMPT } from './gm-prompt';
import type { WorldProposal } from './schema';

export interface WorldPreferences {
  genre: string;
  tone: string;
  themes: string;
  lines: string[];
  veils: string[];
  specialRules?: string;
  /** Idées libres du joueur. */
  ideas?: string;
}

export function buildWorldMessages(prefs: WorldPreferences, previous?: WorldProposal): ChatMessage[] {
  const lines = [
    `Genre : ${prefs.genre || 'au choix'}`,
    `Ton : ${prefs.tone || 'au choix'}`,
    `Thèmes souhaités : ${prefs.themes || 'au choix'}`,
    `Thèmes à éviter absolument (lignes) : ${prefs.lines.join(', ') || 'aucun'}`,
    `Thèmes à garder hors champ (voiles) : ${prefs.veils.join(', ') || 'aucun'}`,
  ];
  if (prefs.specialRules) lines.push(`Règles spéciales : ${prefs.specialRules}`);
  if (prefs.ideas) lines.push(`Idées du joueur : ${prefs.ideas}`);
  if (previous) lines.push(`Le joueur a refusé cette proposition, propose quelque chose de nettement différent : ${previous.title} — ${previous.pitch}`);
  return [
    { role: 'system', content: WORLD_SYSTEM_PROMPT },
    { role: 'user', content: lines.join('\n') },
  ];
}

/** Transforme une proposition de monde validée en partie neuve (sans personnage). */
export function gameFromWorld(world: WorldProposal, prefs: WorldPreferences): GameState {
  const campaign: Campaign = {
    title: world.title,
    genre: prefs.genre || 'Fantasy',
    tone: prefs.tone || 'Aventure',
    setting: world.setting,
    pitch: world.pitch,
    lines: prefs.lines,
    veils: prefs.veils,
    specialRules: prefs.specialRules,
  };
  const state = createGameState({
    campaign,
    startingLocation: world.starting_location,
    npcs: world.npcs.map((n) => ({
      id: n.id,
      name: n.name,
      description: n.description,
      attitude: n.attitude,
      secrets: n.secret ? [n.secret] : [],
    })),
    quests: [{ id: world.quest.id, title: world.quest.title, objective: world.quest.objective }],
    lore: world.lore,
  });
  state.flags['ouverture'] = true;
  state.log.push({ id: 'ouverture', turn: 0, at: state.createdAt, kind: 'gm', text: world.opening });
  return state;
}
