import type { GameState, RollResult, TurnMode } from '@veillee/engine';
import { maybeSummarize, runTurn, type LlmCall, type PlayerAction, type TurnEvent } from '@veillee/prompts';

export type LiveItem =
  | { kind: 'player'; name: string; text: string }
  | { kind: 'gm'; text: string }
  | { kind: 'roll'; roll: RollResult; characterName: string }
  | { kind: 'combat'; text: string }
  | { kind: 'system'; text: string };

/** Ce qui s'affiche pendant qu'un tour est en cours de résolution. */
export interface LiveTurn {
  items: LiveItem[];
  streaming: string | null;
  retrying: boolean;
}

export interface PendingAction {
  id: string | number;
  characterId: string;
  characterName: string;
  text: string;
  kind: PlayerAction['kind'];
}

export interface GameController {
  mode: 'solo' | 'online';
  state: GameState;
  busy: boolean;
  live: LiveTurn | null;
  /** Dernier jet à animer. */
  dice: { roll: RollResult; characterName: string; key: number } | null;
  error: string | null;
  isHost: boolean;
  /** Personnages que ce joueur contrôle. */
  controlledIds: string[];
  pending: PendingAction[];
  canUndo: boolean;
  inviteUrl?: string;
  submit(action: PlayerAction): Promise<void>;
  undo(): Promise<void>;
  regenerate(): Promise<void>;
  replaceState(state: GameState): Promise<void>;
  setTurnMode(mode: TurnMode): Promise<void>;
  resolvePending(): Promise<void>;
  dismissError(): void;
}

export function emptyLive(): LiveTurn {
  return { items: [], streaming: null, retrying: false };
}

/** Applique un événement de tour à l'affichage en direct. */
export function reduceLive(live: LiveTurn, event: TurnEvent): LiveTurn {
  switch (event.type) {
    case 'gm_start':
      return { ...live, streaming: '' };
    case 'narration_delta':
      return { ...live, streaming: (live.streaming ?? '') + event.text };
    case 'gm_retry':
      return { ...live, streaming: '', retrying: true };
    case 'gm_done':
      return { ...live, streaming: null, retrying: false, items: [...live.items, { kind: 'gm', text: event.narration }] };
    case 'roll':
      return { ...live, items: [...live.items, { kind: 'roll', roll: event.roll, characterName: event.characterName }] };
    case 'combat':
      return { ...live, items: [...live.items, ...event.events.map((e) => ({ kind: 'combat' as const, text: e.text }))] };
    case 'rules':
      return { ...live, items: [...live.items, ...event.events.map((text) => ({ kind: 'system' as const, text }))] };
  }
}

/** Un tour complet : résolution par le moteur puis mise à jour éventuelle du résumé glissant. */
export async function playTurn(state: GameState, actions: PlayerAction[], llm: LlmCall, onEvent: (e: TurnEvent) => void, signal?: AbortSignal) {
  const result = await runTurn({ state, actions, llm, onEvent, signal });
  const summarized = await maybeSummarize(result.state, llm);
  return { ...result, state: summarized };
}

export function errorMessage(e: unknown): string {
  if (e instanceof DOMException && e.name === 'AbortError') return 'Tour annulé.';
  return e instanceof Error ? e.message : String(e);
}
