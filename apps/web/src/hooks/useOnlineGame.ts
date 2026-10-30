import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { addCharacter, createCharacter, isConscious, type GameState, type NewCharacterInput, type TurnMode } from '@veillee/engine';
import type { PlayerAction, TurnEvent } from '@veillee/prompts';
import { emptyLive, errorMessage, playTurn, reduceLive, type GameController, type LiveTurn, type PendingAction } from '../lib/controller';
import { createLlm } from '../lib/llm';
import {
  fetchGame,
  fetchMembers,
  fetchPendingActions,
  inviteUrl,
  saveOnlineState,
  setActionsStatus,
  submitOnlineAction,
  type ActionRow,
  type GameRow,
  type MemberRow,
} from '../lib/online';
import { supabase } from '../lib/supabase';
import type { UndoEntry } from '../lib/storage';

export interface OnlineGame extends GameController {
  loading: boolean;
  loadError: string | null;
  members: MemberRow[];
  userId: string;
  hasCharacter: boolean;
  characterRequested: boolean;
  requestCharacter(input: NewCharacterInput): Promise<void>;
}

/**
 * Partie en ligne. L'hôte est l'arbitre : son navigateur résout les tours (IA + moteur) et écrit l'état ;
 * les autres joueurs déclarent leurs actions dans la table `actions` et reçoivent tout en temps réel.
 */
export function useOnlineGame(gameId: string, userId: string): OnlineGame {
  const [row, setRow] = useState<GameRow | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [actions, setActions] = useState<ActionRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState<LiveTurn | null>(null);
  const [dice, setDice] = useState<GameController['dice']>(null);
  const [error, setError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [requested, setRequested] = useState(false);
  const channelRef = useRef<ReturnType<NonNullable<typeof supabase>['channel']> | null>(null);
  const rowRef = useRef(row);
  rowRef.current = row;
  const busyRef = useRef(false);

  const isHost = !!row && row.host_id === userId;

  const reload = useCallback(async () => {
    try {
      const [g, m, a] = await Promise.all([fetchGame(gameId), fetchMembers(gameId), fetchPendingActions(gameId)]);
      setRow(g);
      setMembers(m);
      setActions(a);
      setLoadError(null);
    } catch (e) {
      setLoadError(errorMessage(e));
    }
  }, [gameId]);

  useEffect(() => {
    void reload();
    if (!supabase) return;
    const channel = supabase
      .channel(`partie:${gameId}`, { config: { broadcast: { self: false } } })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` }, () => {
        // l'état peut être volumineux : on relit la ligne plutôt que de se fier au message
        fetchGame(gameId).then(setRow).catch(() => {});
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'actions', filter: `game_id=eq.${gameId}` }, (p) => {
        const a = p.new as ActionRow;
        setActions((list) => (list.some((x) => x.id === a.id) ? list : [...list, a]));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'actions', filter: `game_id=eq.${gameId}` }, (p) => {
        const a = p.new as ActionRow;
        setActions((list) => (a.status === 'en_attente' ? list : list.filter((x) => x.id !== a.id)));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_members', filter: `game_id=eq.${gameId}` }, () => {
        fetchMembers(gameId).then(setMembers).catch(() => {});
      })
      .on('broadcast', { event: 'live' }, ({ payload }) => setLive(payload as LiveTurn | null))
      .on('broadcast', { event: 'dice' }, ({ payload }) => setDice(payload as GameController['dice']))
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') void reload();
      });
    channelRef.current = channel;
    return () => {
      void supabase?.removeChannel(channel);
      channelRef.current = null;
    };
  }, [gameId, reload]);

  const broadcast = useCallback((event: 'live' | 'dice', payload: unknown) => {
    void channelRef.current?.send({ type: 'broadcast', event, payload });
  }, []);

  const memberName = useCallback((uid: string) => members.find((m) => m.user_id === uid)?.display_name || 'Joueur', [members]);

  /** Résolution d'un tour par l'hôte, diffusée en direct aux autres joueurs. */
  const resolve = useCallback(
    async (base: GameRow, batch: ActionRow[], playerActions: PlayerAction[]) => {
      busyRef.current = true;
      setBusy(true);
      setError(null);
      let current = emptyLive();
      current.items = playerActions
        .filter((a) => a.kind !== 'xcard')
        .map((a) => ({ kind: 'player' as const, name: base.state.characters.find((c) => c.id === a.characterId)?.name ?? 'Joueur', text: a.text || 'attaque !' }));
      setLive(current);
      broadcast('live', current);
      let lastSent = 0;
      const onEvent = (event: TurnEvent) => {
        current = reduceLive(current, event);
        setLive(current);
        const now = Date.now();
        if (event.type !== 'narration_delta' || now - lastSent > 150) {
          lastSent = now;
          broadcast('live', current);
        }
        if (event.type === 'roll') {
          const d = { roll: event.roll, characterName: event.characterName, key: now };
          setDice(d);
          broadcast('dice', d);
        }
      };
      try {
        const result = await playTurn(base.state, playerActions, createLlm(base.id), onEvent);
        const undo: UndoEntry[] = [...(base.undo_stack ?? []), { state: base.state, actions: playerActions }];
        await saveOnlineState(base.id, result.state, undo);
        await setActionsStatus(batch.map((a) => a.id), 'resolue');
        setRow({ ...base, state: result.state, undo_stack: undo.slice(-5) });
        setActions((list) => list.filter((a) => !batch.some((b) => b.id === a.id)));
      } catch (e) {
        setError(`${errorMessage(e)} — la résolution automatique est en pause ; « Résoudre le tour » pour réessayer.`);
        setPaused(true);
      } finally {
        busyRef.current = false;
        setBusy(false);
        setLive(null);
        broadcast('live', null);
      }
    },
    [broadcast],
  );

  const addCharacters = useCallback(
    async (base: GameRow, requests: ActionRow[]) => {
      let state = base.state;
      const accepted: number[] = [];
      const rejected: number[] = [];
      for (const req of requests) {
        try {
          if (state.characters.some((c) => c.playerId === req.user_id)) throw new Error('déjà un personnage');
          const input = req.payload as NewCharacterInput;
          const pc = createCharacter({ ...input, id: undefined, playerId: req.user_id, playerName: memberName(req.user_id) });
          state = addCharacter(state, pc);
          state.log.push({ id: `arrivee_${pc.id}`, turn: state.turn, at: new Date().toISOString(), kind: 'system', text: `${pc.name} (${pc.concept}) rejoint le groupe.` });
          accepted.push(req.id);
        } catch {
          rejected.push(req.id);
        }
      }
      state = { ...state, updatedAt: new Date().toISOString() };
      await saveOnlineState(base.id, state, base.undo_stack ?? []);
      await setActionsStatus(accepted, 'resolue');
      await setActionsStatus(rejected, 'rejetee');
      setRow({ ...base, state });
      setActions((list) => list.filter((a) => !requests.includes(a)));
    },
    [memberName],
  );

  const toPlayerAction = (a: ActionRow): PlayerAction => a.payload as PlayerAction;

  /** Seules les actions portant sur un personnage du joueur qui les envoie sont acceptées. */
  const legit = useCallback((a: ActionRow, state: GameState) => {
    const p = a.payload as PlayerAction;
    const pc = state.characters.find((c) => c.id === p.characterId);
    return !!pc && pc.playerId === a.user_id;
  }, []);

  // Boucle de l'hôte : traite la file d'actions.
  useEffect(() => {
    if (!isHost || !row || busyRef.current) return;
    const charReqs = actions.filter((a) => a.kind === 'character');
    if (charReqs.length) {
      busyRef.current = true;
      void addCharacters(row, charReqs).finally(() => (busyRef.current = false));
      return;
    }
    const turnActions = actions.filter((a) => a.kind !== 'character');
    const bogus = turnActions.filter((a) => !legit(a, row.state));
    if (bogus.length) {
      void setActionsStatus(bogus.map((a) => a.id), 'rejetee');
      setActions((list) => list.filter((a) => !bogus.includes(a)));
      return;
    }
    if (paused || !turnActions.length) return;
    const xcard = turnActions.find((a) => a.kind === 'xcard');
    if (xcard) {
      void resolve(row, [xcard], [toPlayerAction(xcard)]);
      return;
    }
    if (row.state.turnMode === 'libre') {
      const first = turnActions[0];
      void resolve(row, [first], [toPlayerAction(first)]);
      return;
    }
    // mode par tour : on attend que chaque personnage joueur conscient ait déclaré une action
    const waitingFor = row.state.characters.filter((c) => c.playerId && isConscious(c) && !turnActions.some((a) => (a.payload as PlayerAction).characterId === c.id));
    if (waitingFor.length === 0) void resolve(row, turnActions, dedupe(turnActions).map(toPlayerAction));
  }, [isHost, row, actions, paused, resolve, addCharacters, legit]);

  const state = row?.state ?? null;
  const controlledIds = useMemo(() => (state ? state.characters.filter((c) => c.playerId === userId).map((c) => c.id) : []), [state, userId]);

  const pending: PendingAction[] = useMemo(
    () =>
      actions
        .filter((a) => a.kind !== 'character')
        .map((a) => {
          const p = a.payload as PlayerAction;
          return { id: a.id, characterId: p.characterId, characterName: state?.characters.find((c) => c.id === p.characterId)?.name ?? '?', text: p.text, kind: p.kind };
        }),
    [actions, state],
  );

  const undoStack = row?.undo_stack ?? [];

  const controller: OnlineGame = {
    mode: 'online',
    state: state ?? (placeholder as GameState),
    busy,
    live,
    dice,
    error,
    isHost,
    controlledIds,
    pending: state?.turnMode === 'tour' ? pending : busy ? [] : pending,
    canUndo: isHost && undoStack.length > 0 && !busy,
    inviteUrl: row ? inviteUrl(row.invite_code) : undefined,
    loading: !row && !loadError,
    loadError,
    members,
    userId,
    hasCharacter: controlledIds.length > 0,
    characterRequested: requested || actions.some((a) => a.kind === 'character' && a.user_id === userId),
    async submit(action) {
      setError(null);
      try {
        await submitOnlineAction(gameId, action.kind, action);
      } catch (e) {
        setError(errorMessage(e));
      }
    },
    async requestCharacter(input) {
      try {
        await submitOnlineAction(gameId, 'character', input);
        setRequested(true);
      } catch (e) {
        setError(errorMessage(e));
      }
    },
    async undo() {
      if (!row || !undoStack.length) return;
      const last = undoStack[undoStack.length - 1];
      const stack = undoStack.slice(0, -1);
      await saveOnlineState(row.id, last.state, stack);
      setRow({ ...row, state: last.state, undo_stack: stack });
    },
    async regenerate() {
      if (!row || !undoStack.length) return;
      const last = undoStack[undoStack.length - 1];
      const base = { ...row, state: last.state, undo_stack: undoStack.slice(0, -1) };
      setRow(base);
      await resolve(base, [], last.actions);
    },
    async replaceState(next) {
      if (!row) return;
      const stack = [...undoStack, { state: row.state, actions: [] }];
      const s = { ...next, updatedAt: new Date().toISOString() };
      await saveOnlineState(row.id, s, stack);
      setRow({ ...row, state: s, undo_stack: stack.slice(-5) });
    },
    async setTurnMode(mode: TurnMode) {
      if (!row) return;
      const s = { ...row.state, turnMode: mode };
      await saveOnlineState(row.id, s, undoStack);
      setRow({ ...row, state: s });
    },
    async resolvePending() {
      if (!row || busyRef.current) return;
      setPaused(false);
      const turnActions = actions.filter((a) => a.kind !== 'character' && legit(a, row.state));
      if (turnActions.length) await resolve(row, turnActions, dedupe(turnActions).map(toPlayerAction));
    },
    dismissError: () => setError(null),
  };
  return controller;
}

/** Une seule action par personnage dans un tour : on garde la plus récente. */
function dedupe(list: ActionRow[]): ActionRow[] {
  const byPc = new Map<string, ActionRow>();
  for (const a of list) byPc.set((a.payload as PlayerAction).characterId, a);
  return [...byPc.values()];
}

const placeholder = {
  version: 1,
  id: '',
  createdAt: '',
  updatedAt: '',
  campaign: { title: 'Chargement…', genre: '', tone: '', setting: '', pitch: '', lines: [], veils: [] },
  characters: [],
  npcs: [],
  locations: [],
  currentLocationId: null,
  quests: [],
  flags: {},
  summary: '',
  summarizedThroughTurn: 0,
  lore: [],
  log: [],
  memoryNotes: [],
  pendingRejections: [],
  suggestedActions: [],
  combat: null,
  turn: 0,
  turnMode: 'libre',
};
