import type { GameState } from '@veillee/engine';
import type { PlayerAction } from '@veillee/prompts';
import type { NewCharacterInput } from '@veillee/engine';
import { supabase } from './supabase';
import type { UndoEntry } from './storage';

export interface GameRow {
  id: string;
  host_id: string;
  title: string;
  invite_code: string;
  state: GameState;
  undo_stack: UndoEntry[];
  updated_at: string;
}

export interface MemberRow {
  game_id: string;
  user_id: string;
  display_name: string;
  role: 'hote' | 'joueur';
}

export type ActionKind = 'action' | 'attack' | 'xcard' | 'character';

export interface ActionRow {
  id: number;
  game_id: string;
  user_id: string;
  kind: ActionKind;
  payload: PlayerAction | NewCharacterInput;
  status: 'en_attente' | 'resolue' | 'rejetee';
  created_at: string;
}

function db() {
  if (!supabase) throw new Error("Le multijoueur n'est pas configuré (VITE_SUPABASE_URL manquant).");
  return supabase;
}

function check<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export async function createOnlineGame(state: GameState, displayName: string): Promise<GameRow> {
  const row = check(await db().from('games').insert({ title: state.campaign.title, state, host_name: displayName }).select().single()) as GameRow;
  return row;
}

export async function listMyGames(): Promise<Array<Pick<GameRow, 'id' | 'title' | 'updated_at' | 'host_id'>>> {
  return check(await db().from('games').select('id,title,updated_at,host_id').order('updated_at', { ascending: false }).limit(30)) ?? [];
}

export async function joinGame(code: string, displayName: string): Promise<string> {
  return check(await db().rpc('join_game', { code, name: displayName })) as string;
}

export async function fetchGame(id: string): Promise<GameRow> {
  return check(await db().from('games').select('*').eq('id', id).single()) as GameRow;
}

export async function fetchMembers(id: string): Promise<MemberRow[]> {
  return check(await db().from('game_members').select('*').eq('game_id', id)) ?? [];
}

export async function fetchPendingActions(id: string): Promise<ActionRow[]> {
  return check(await db().from('actions').select('*').eq('game_id', id).eq('status', 'en_attente').order('id')) ?? [];
}

export async function saveOnlineState(id: string, state: GameState, undoStack: UndoEntry[]) {
  check(await db().from('games').update({ state, undo_stack: undoStack.slice(-5), title: state.campaign.title, updated_at: new Date().toISOString() }).eq('id', id));
}

export async function submitOnlineAction(gameId: string, kind: ActionKind, payload: ActionRow['payload']) {
  check(await db().from('actions').insert({ game_id: gameId, kind, payload }));
}

export async function setActionsStatus(ids: number[], status: ActionRow['status']) {
  if (!ids.length) return;
  check(await db().from('actions').update({ status }).in('id', ids));
}

export async function deleteOnlineGame(id: string) {
  check(await db().from('games').delete().eq('id', id));
}

export function inviteUrl(code: string): string {
  return `${window.location.origin}${window.location.pathname}#/rejoindre/${code}`;
}
