import type { EnemyInput } from './combat';
import { createGameState } from './state';
import type { Ability, Campaign, Difficulty, GameState, Location, Npc } from './types';

/** Jet prévu par le scénario : le MJ le demande quand la situation se présente. */
export interface ScenarioCheck {
  situation: string;
  ability: Ability;
  difficulty: Difficulty;
  success: string;
  failure: string;
}

/** Combat prévu par le scénario, avec des ennemis aux caractéristiques fixées d'avance. */
export interface ScenarioEncounter {
  trigger: string;
  enemies: EnemyInput[];
  /** Comment le combat peut être évité ou abrégé. */
  alternatives?: string;
}

export interface ScenarioExit {
  to: string;
  when: string;
}

export interface ScenarioScene {
  id: string;
  title: string;
  /** Lieu de la scène (id de `Scenario.locations`). */
  locationId: string;
  /** Texte d'ouverture à lire aux joueurs en entrant dans la scène. */
  readAloud: string;
  /** Ce que le MJ sait : déroulé, réactions des PNJ, indices à donner. */
  gmNotes: string;
  /** PNJ présents ou mobilisables dans la scène. */
  npcIds?: string[];
  checks?: ScenarioCheck[];
  encounter?: ScenarioEncounter;
  /** Récompenses prévues (objets, or, XP) que le MJ accorde via state_changes. */
  rewards?: string;
  exits: ScenarioExit[];
  /** Scène finale : l'aventure se conclut ici. */
  ending?: 'victoire' | 'défaite' | 'mitigée';
}

export interface ScenarioNpc {
  id: string;
  name: string;
  description: string;
  attitude: string;
  /** Ce que le PNJ veut et comment il réagit, pour l'incarner. */
  motivation: string;
  secret?: string;
  locationId?: string;
  hp?: number;
}

/** Aventure écrite à l'avance que le MJ IA suit et adapte aux choix des joueurs. */
export interface Scenario {
  id: string;
  title: string;
  /** Auteur et licence, affichés aux joueurs. */
  credits: { author: string; license: string; source?: string };
  genre: string;
  tone: string;
  /** Résumé pour choisir le scénario (sans divulgâcher). */
  blurb: string;
  players: string;
  /** Nombre de joueurs pour lequel l'aventure est équilibrée : en dessous, proposer des compagnons PNJ. */
  minPlayers: number;
  duration: string;
  setting: string;
  pitch: string;
  /** Vérité cachée de l'intrigue, connue du MJ seul. */
  secretPlot: string;
  /** Conseils au MJ pour adapter l'aventure. */
  gmAdvice: string;
  locations: Location[];
  npcs: ScenarioNpc[];
  quest: { id: string; title: string; objective: string };
  lore: Array<{ keywords: string[]; text: string }>;
  startSceneId: string;
  scenes: ScenarioScene[];
}

/** Scénario embarqué dans une partie, avec la progression. */
export interface ScenarioState {
  scenario: Scenario;
  currentSceneId: string;
  visitedSceneIds: string[];
}

export function currentScene(state: GameState): ScenarioScene | undefined {
  const s = state.scenario;
  return s?.scenario.scenes.find((sc) => sc.id === s.currentSceneId);
}

/** Fiche de PNJ prête à entrer dans l'état, si le scénario prévoit ce PNJ et qu'il n'y est pas encore. */
export function scenarioNpc(state: GameState, id: string): Npc | undefined {
  const def = state.scenario?.scenario.npcs.find((n) => n.id === id);
  if (!def || state.npcs.some((n) => n.id === id)) return undefined;
  return {
    id: def.id,
    name: def.name,
    description: def.description,
    attitude: def.attitude,
    status: 'vivant',
    secrets: def.secret ? [def.secret] : [],
    locationId: state.currentLocationId ?? undefined,
    ...(def.hp ? { hp: def.hp, maxHp: def.hp } : {}),
  };
}

/**
 * Fait entrer le groupe dans une scène : lieu courant, PNJ de la scène, progression.
 * Modifie l'état en place (à appeler sur une copie) et renvoie les événements à afficher.
 */
export function enterScene(state: GameState, sceneId: string): string[] {
  const sc = state.scenario;
  const scene = sc?.scenario.scenes.find((x) => x.id === sceneId);
  if (!sc || !scene) return [];
  sc.currentSceneId = scene.id;
  if (!sc.visitedSceneIds.includes(scene.id)) sc.visitedSceneIds.push(scene.id);
  const loc = sc.scenario.locations.find((l) => l.id === scene.locationId);
  if (loc) {
    if (!state.locations.some((l) => l.id === loc.id)) state.locations.push({ ...loc });
    state.currentLocationId = loc.id;
  }
  for (const id of scene.npcIds ?? []) {
    const fresh = scenarioNpc(state, id);
    if (fresh) {
      const def = sc.scenario.npcs.find((n) => n.id === id);
      fresh.locationId = def?.locationId ?? state.currentLocationId ?? undefined;
      state.npcs.push(fresh);
    }
  }
  const events = [`Scène : ${scene.title}`];
  if (scene.ending) events.push(`L'aventure « ${sc.scenario.title} » touche à sa fin.`);
  return events;
}

export interface ScenarioSafety {
  lines: string[];
  veils: string[];
  specialRules?: string;
}

/** Crée une partie neuve (sans personnage) qui suit un scénario prêt à jouer. */
export function gameFromScenario(scenario: Scenario, safety: ScenarioSafety): GameState {
  const start = scenario.scenes.find((s) => s.id === scenario.startSceneId) ?? scenario.scenes[0];
  const startLoc = scenario.locations.find((l) => l.id === start.locationId) ?? scenario.locations[0];
  const campaign: Campaign = {
    title: scenario.title,
    genre: scenario.genre,
    tone: scenario.tone,
    setting: scenario.setting,
    pitch: scenario.pitch,
    lines: safety.lines,
    veils: safety.veils,
    specialRules: safety.specialRules,
  };
  const state = createGameState({
    campaign,
    startingLocation: { name: startLoc.name, description: startLoc.description },
    quests: [{ id: scenario.quest.id, title: scenario.quest.title, objective: scenario.quest.objective }],
    lore: scenario.lore,
  });
  // le lieu de départ garde l'id prévu par le scénario
  state.locations = [{ ...startLoc }];
  state.currentLocationId = startLoc.id;
  state.scenario = { scenario: structuredClone(scenario), currentSceneId: start.id, visitedSceneIds: [] };
  enterScene(state, start.id);
  state.flags['ouverture'] = true;
  state.log.push({ id: 'ouverture', turn: 0, at: state.createdAt, kind: 'gm', text: start.readAloud });
  return state;
}
