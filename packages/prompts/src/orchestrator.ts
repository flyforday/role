import {
  ABILITY_LABELS,
  DIFFICULTY_LABELS,
  abilityCheck,
  addLog,
  applyChanges,
  defaultRng,
  describeAdjustment,
  describeRejection,
  newBudget,
  resolveRound,
  type ChangeLimits,
  type CombatEvent,
  type Difficulty,
  type GameState,
  type RollResult,
  type Rng,
} from '@veillee/engine';
import { buildGmMessages, stateExtract, type ChatMessage, type ContextOptions, type PlayerAction } from './context';
import { ROLL_RESULT_INSTRUCTIONS } from './gm-prompt';
import { NarrationExtractor, fallbackNarration, parseGmResponse } from './parse';
import type { GmResponse } from './schema';

export interface LlmCallOptions {
  json: boolean;
  purpose: 'turn' | 'summary' | 'world';
  onToken?: (token: string) => void;
  signal?: AbortSignal;
}

/** Appel au modèle : renvoie le texte complet, en appelant onToken au fil du flux. */
export type LlmCall = (messages: ChatMessage[], options: LlmCallOptions) => Promise<string>;

export type TurnEvent =
  | { type: 'gm_start' }
  | { type: 'narration_delta'; text: string }
  | { type: 'gm_retry'; reason: string }
  | { type: 'gm_done'; narration: string }
  | { type: 'roll'; roll: RollResult; characterName: string }
  | { type: 'combat'; events: CombatEvent[] }
  | { type: 'rules'; events: string[] };

export interface RunTurnInput {
  state: GameState;
  actions: PlayerAction[];
  llm: LlmCall;
  rng?: Rng;
  onEvent?: (event: TurnEvent) => void;
  context?: ContextOptions;
  limits?: Partial<ChangeLimits>;
  signal?: AbortSignal;
  /** Nombre maximal de jets demandés par l'IA dans un même tour. */
  maxRolls?: number;
}

export interface TurnResult {
  state: GameState;
  /** Raisons des refus (aussi stockées dans state.pendingRejections pour le tour suivant). */
  rejected: string[];
  usedFallback: boolean;
}

const FALLBACK_NARRATION = 'Le Maître du Jeu marque une pause, le regard perdu dans ses notes… Que faites-vous ?';

/**
 * Boucle d'un tour : contexte → IA → validation → jets de dés par le code → application des changements.
 * Ne modifie jamais l'état d'entrée ; en cas d'erreur réseau l'exception remonte et l'état reste intact.
 */
export async function runTurn(input: RunTurnInput): Promise<TurnResult> {
  const rng = input.rng ?? defaultRng;
  const emit = input.onEvent ?? (() => {});
  const maxRolls = input.maxRolls ?? 2;
  let state = structuredClone(input.state);
  state.turn += 1;

  for (const a of input.actions) {
    const pc = state.characters.find((c) => c.id === a.characterId);
    if (a.kind === 'xcard') addLog(state, { kind: 'system', text: 'Carte X utilisée : la scène change de direction.' });
    else addLog(state, { kind: 'player', actorId: pc?.id, actorName: pc?.name ?? 'Joueur', text: a.kind === 'attack' && !a.text ? 'attaque !' : a.text });
  }

  // 1. Combat : le code résout les attaques et les ripostes avant que le MJ ne raconte.
  const codeEvents: string[] = [];
  if (state.combat) {
    const attacks = input.actions.filter((a) => a.kind === 'attack').map((a) => ({ characterId: a.characterId, targetId: a.targetId ?? '' }));
    const round = resolveRound(state, attacks, rng);
    state = round.state;
    if (round.events.length) {
      emit({ type: 'combat', events: round.events });
      for (const e of round.events) {
        addLog(state, { kind: 'combat', text: e.text });
        codeEvents.push(e.text);
      }
    }
  }

  const messages = buildGmMessages(state, input.actions, { ...input.context, codeEvents });
  state.pendingRejections = [];

  const rejected: string[] = [];
  const budget = newBudget();
  let usedFallback = false;
  let rolls = 0;
  let conversation = messages;
  let response: GmResponse | null = null;

  while (true) {
    const call = await callGm(conversation, input.llm, emit, input.signal);
    usedFallback ||= call.fallback;
    response = call.response;
    addLog(state, { kind: 'gm', text: response.narration });
    emit({ type: 'gm_done', narration: response.narration });
    rejected.push(...call.invalid);

    const applied = applyChanges(state, response.state_changes, { limits: input.limits, rng, budget });
    state = applied.state;
    rejected.push(...applied.rejected.map(describeRejection), ...applied.adjusted.map(describeAdjustment));
    if (applied.events.length) {
      emit({ type: 'rules', events: applied.events });
      for (const text of applied.events) addLog(state, { kind: 'system', text });
    }
    for (const note of response.memory_notes) if (!state.memoryNotes.includes(note)) state.memoryNotes.push(note);

    const req = response.roll_request;
    if (!req) break;
    if (rolls >= maxRolls) {
      rejected.push(`Le jet demandé (${req.reason}) a été ignoré : maximum ${maxRolls} jets par tour.`);
      break;
    }
    const pc = state.characters.find((c) => c.id === req.character_id);
    if (!pc) {
      rejected.push(`Le jet demandé pour « ${req.character_id} » a été refusé car ce personnage n'existe pas.`);
      break;
    }
    rolls++;
    const roll = abilityCheck({ characterId: pc.id, ability: req.ability, modifier: pc.abilities[req.ability], difficulty: req.difficulty, reason: req.reason }, rng);
    emit({ type: 'roll', roll, characterName: pc.name });
    addLog(state, { kind: 'roll', actorId: pc.id, actorName: pc.name, text: describeRoll(roll, pc.name), roll });

    conversation = [
      ...conversation,
      { role: 'assistant', content: JSON.stringify(response) },
      {
        role: 'user',
        content: [
          `RÉSULTAT DU JET (lancé par le code) : ${describeRoll(roll, pc.name)}`,
          rejected.length ? `Changements refusés : ${rejected.join(' ')}` : '',
          stateExtract(state),
          ROLL_RESULT_INSTRUCTIONS,
        ]
          .filter(Boolean)
          .join('\n\n'),
      },
    ];
  }

  state.suggestedActions = response?.suggested_actions ?? [];
  state.memoryNotes = state.memoryNotes.slice(-40);
  state.pendingRejections = rejected.slice(-10);
  state.updatedAt = new Date().toISOString();
  return { state, rejected, usedFallback };
}

export function describeRoll(roll: RollResult, name: string): string {
  const diff = DIFFICULTY_LABELS[roll.difficulty as Difficulty] ?? String(roll.difficulty);
  const mod = roll.modifier >= 0 ? `+${roll.modifier}` : `${roll.modifier}`;
  const verdict = roll.critical === 'réussite' ? 'RÉUSSITE CRITIQUE' : roll.critical === 'échec' ? 'ÉCHEC CRITIQUE' : roll.success ? 'réussite' : 'échec';
  return `${name} — ${ABILITY_LABELS[roll.ability]} (${roll.reason}) : d20 = ${roll.natural} ${mod} = ${roll.total} contre ${roll.difficulty} (${diff}) → ${verdict}`;
}

interface GmCall {
  response: GmResponse;
  fallback: boolean;
  invalid: string[];
}

/** Appelle le MJ ; en cas de JSON invalide, une nouvelle tentative avec l'erreur, puis repli sur une narration seule. */
async function callGm(messages: ChatMessage[], llm: LlmCall, emit: (e: TurnEvent) => void, signal?: AbortSignal): Promise<GmCall> {
  const stream = async (msgs: ChatMessage[]) => {
    emit({ type: 'gm_start' });
    const extractor = new NarrationExtractor();
    return llm(msgs, {
      json: true,
      purpose: 'turn',
      signal,
      onToken: (t) => {
        const delta = extractor.push(t);
        if (delta) emit({ type: 'narration_delta', text: delta });
      },
    });
  };

  const raw = await stream(messages);
  let parsed = parseGmResponse(raw);
  let lastRaw = raw;
  if (!parsed.ok) {
    emit({ type: 'gm_retry', reason: parsed.error });
    lastRaw = await stream([
      ...messages,
      { role: 'assistant', content: raw.slice(0, 4000) },
      {
        role: 'user',
        content: `Ta réponse n'est pas un JSON valide conforme au schéma (${parsed.error}). Renvoie uniquement l'objet JSON corrigé, sans texte autour.`,
      },
    ]);
    parsed = parseGmResponse(lastRaw);
  }
  if (!parsed.ok) {
    const narration = fallbackNarration(lastRaw) || fallbackNarration(raw) || FALLBACK_NARRATION;
    return {
      response: { narration, roll_request: null, state_changes: [], memory_notes: [], suggested_actions: [] },
      fallback: true,
      invalid: ['La réponse précédente était illisible : aucun changement d\'état n\'a été appliqué.'],
    };
  }
  const invalid = parsed.invalidChanges.map((c) => `Le changement ${JSON.stringify(c.raw)} a été refusé car il est mal formé (${c.reason}).`);
  if (parsed.invalidRoll) invalid.push(`La demande de jet a été refusée car elle est mal formée (${parsed.invalidRoll}).`);
  return { response: parsed.value, fallback: false, invalid };
}
