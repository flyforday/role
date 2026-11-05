import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { addCharacter, createCharacter, isConscious, moveOnMap, type MapMoveInput, type GameState, type NewCharacterInput, type TurnMode } from '@veillee/engine';
import type { PlayerAction, TurnEvent } from '@veillee/prompts';
import { emptyLive, errorMessage, playTurn, reduceLive, type GameController, type LiveTurn, type PendingAction } from '../lib/controller';
import { createLlm } from '../lib/llm';
import { identity, inviteUrl, rememberRoom, RoomConnection, type ConnectionStatus, type RoomAction, type RoomMember, type ServerMessage } from '../lib/salle';
import type { UndoEntry } from '../lib/storage';

export interface OnlineGame extends GameController {
  code: string;
  loading: boolean;
  loadError: string | null;
  status: ConnectionStatus;
  members: RoomMember[];
  userId: string;
  hostOnline: boolean;
  hasCharacter: boolean;
  characterRequested: boolean;
  requestCharacter(input: NewCharacterInput): Promise<void>;
  takeOver(): void;
}

interface Room {
  state: GameState;
  undo: UndoEntry[];
}

/** Intervalle minimal entre deux envois du texte du MJ en cours d'écriture (ms). */
const LIVE_THROTTLE = 120;

/**
 * Partie en ligne. Le navigateur de l'hôte est l'arbitre : il résout les tours (IA + moteur) et
 * envoie l'état à la salle, qui le relaie aux autres joueurs en temps réel. Les autres joueurs
 * déclarent leurs actions ; en mode « par tour », le MJ répond quand tout le monde a joué.
 */
export function useOnlineGame(code: string, displayName: string): OnlineGame {
  const userId = identity().playerId;
  const [room, setRoom] = useState<Room | null>(null);
  const [hostId, setHostId] = useState<string | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [actions, setActions] = useState<RoomAction[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('connexion');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState<LiveTurn | null>(null);
  const [dice, setDice] = useState<GameController['dice']>(null);
  const [error, setError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [requested, setRequested] = useState(false);
  const connRef = useRef<RoomConnection | null>(null);
  const busyRef = useRef(false);

  const isHost = hostId === userId;

  useEffect(() => {
    const onMessage = (m: ServerMessage) => {
      switch (m.t) {
        case 'bienvenue':
          setRoom({ state: m.state, undo: m.undo ?? [] });
          setHostId(m.hostId);
          setMembers(m.members);
          setActions(m.actions);
          setLoadError(null);
          rememberRoom({ code, title: m.state.campaign.title, host: m.hostId === userId });
          break;
        case 'membres':
          setHostId(m.hostId);
          setMembers(m.members);
          break;
        case 'action':
          setActions((list) => (list.some((a) => a.id === m.action.id) ? list : [...list, m.action]));
          break;
        case 'retirees':
          if (m.reason === 'rejetee') setError('Une demande a été refusée : vérifiez la position du pion, les obstacles et les règles de la scène.');
          setActions((list) => list.filter((a) => !m.ids.includes(a.id)));
          break;
        case 'etat':
          setRoom((r) => ({ state: m.state, undo: r?.undo ?? [] }));
          setActions((list) => list.filter((a) => !m.resolved.includes(a.id)));
          break;
        case 'map_state':
          setRoom((r) => r ? { ...r, state: { ...r.state, maps: { ...r.state.maps, [m.locationId]: m.map } } } : r);
          setActions((list) => list.filter((a) => !m.resolved.includes(a.id)));
          break;
        case 'live':
          setLive(m.data as LiveTurn | null);
          break;
        case 'des':
          setDice(m.data as GameController['dice']);
          break;
        case 'hote':
          setRoom((r) => (r ? { ...r, undo: m.undo ?? [] } : r));
          setHostId(userId);
          break;
        case 'erreur':
          if (m.fatal) setLoadError(m.message);
          else setError(m.message);
          break;
      }
    };
    const conn = new RoomConnection(code, displayName, onMessage, setStatus);
    connRef.current = conn;
    const wake = () => document.visibilityState === 'visible' && conn.wake();
    document.addEventListener('visibilitychange', wake);
    window.addEventListener('online', wake);
    return () => {
      document.removeEventListener('visibilitychange', wake);
      window.removeEventListener('online', wake);
      conn.stop();
      connRef.current = null;
    };
  }, [code, displayName, userId]);

  const send = useCallback((m: Parameters<RoomConnection['send']>[0]) => connRef.current?.send(m), []);

  /** Écrit l'état dans la salle et l'applique tout de suite chez l'hôte. */
  const commit = useCallback(
    (state: GameState, undo: UndoEntry[], resolved: number[] = [], mapOnly = false) => {
      const trimmed = undo.slice(-5);
      setRoom({ state, undo: trimmed });
      if (resolved.length) setActions((list) => list.filter((a) => !resolved.includes(a.id)));
      const map = state.currentLocationId && state.maps?.[state.currentLocationId];
      if (mapOnly && map && state.currentLocationId) send({ t: 'map_state', locationId: state.currentLocationId, map, resolved });
      else if (!mapOnly) send({ t: 'etat', state, undo: trimmed, resolved });
    },
    [send],
  );

  const nameOf = useCallback((pid: string) => members.find((m) => m.playerId === pid)?.name || 'Joueur', [members]);

  /** Résolution d'un tour par l'hôte, diffusée en direct aux autres joueurs. */
  const resolve = useCallback(
    async (base: Room, batch: RoomAction[], playerActions: PlayerAction[]) => {
      busyRef.current = true;
      setBusy(true);
      setError(null);
      let current = emptyLive();
      current.items = playerActions
        .filter((a) => a.kind !== 'xcard')
        .map((a) => ({ kind: 'player' as const, name: base.state.characters.find((c) => c.id === a.characterId)?.name ?? 'Joueur', text: a.text || 'attaque !' }));
      setLive(current);
      send({ t: 'live', data: current });
      let lastSent = 0;
      let trailing: ReturnType<typeof setTimeout> | null = null;
      const flush = () => {
        trailing = null;
        lastSent = Date.now();
        send({ t: 'live', data: current });
      };
      const onEvent = (event: TurnEvent) => {
        current = reduceLive(current, event);
        setLive(current);
        if (event.type !== 'narration_delta') {
          if (trailing) clearTimeout(trailing);
          flush();
        } else if (Date.now() - lastSent > LIVE_THROTTLE) {
          flush();
        } else if (!trailing) {
          trailing = setTimeout(flush, LIVE_THROTTLE);
        }
        if (event.type === 'roll') {
          const d = { roll: event.roll, characterName: event.characterName, key: Date.now() };
          setDice(d);
          send({ t: 'des', data: d });
        }
      };
      try {
        const result = await playTurn(base.state, playerActions, createLlm(code), onEvent);
        commit(result.state, [...base.undo, { state: base.state, actions: playerActions }], batch.map((a) => a.id));
      } catch (e) {
        setError(`${errorMessage(e)} — la résolution automatique est en pause ; « Résoudre le tour » pour réessayer.`);
        setPaused(true);
      } finally {
        if (trailing) clearTimeout(trailing);
        busyRef.current = false;
        setBusy(false);
        setLive(null);
        send({ t: 'live', data: null });
      }
    },
    [send, commit, code],
  );

  const addCharacters = useCallback(
    (base: Room, requests: RoomAction[]) => {
      let state = base.state;
      const accepted: number[] = [];
      const rejected: number[] = [];
      for (const req of requests) {
        try {
          if (state.characters.some((c) => c.playerId === req.playerId)) throw new Error('déjà un personnage');
          const input = req.payload as NewCharacterInput;
          const pc = createCharacter({ ...input, id: undefined, playerId: req.playerId, playerName: nameOf(req.playerId) });
          state = addCharacter(state, pc);
          state.log.push({ id: `arrivee_${pc.id}`, turn: state.turn, at: new Date().toISOString(), kind: 'system', text: `${pc.name} (${pc.concept}) rejoint le groupe.` });
          accepted.push(req.id);
        } catch {
          rejected.push(req.id);
        }
      }
      commit({ ...state, updatedAt: new Date().toISOString() }, base.undo, accepted);
      if (rejected.length) {
        send({ t: 'retirer', ids: rejected, reason: 'rejetee' });
        setActions((list) => list.filter((a) => !rejected.includes(a.id)));
      }
    },
    [nameOf, commit, send],
  );

  const state = room?.state ?? null;
  const turnActions = useMemo(() => actions.filter((a) => a.kind !== 'character' && a.kind !== 'map_move'), [actions]);

  /**
   * Personnages joueurs conscients qui n'ont pas encore déclaré d'action ce tour-ci. Un joueur
   * déconnecté ne bloque pas la table : on n'attend que ceux qui sont là.
   */
  const waitingFor = useMemo(() => {
    if (!state || state.turnMode !== 'tour' || !turnActions.length) return [];
    const online = new Set(members.filter((m) => m.online).map((m) => m.playerId));
    online.add(userId);
    return state.characters.filter(
      (c) => c.playerId && online.has(c.playerId) && isConscious(c) && !turnActions.some((a) => (a.payload as PlayerAction).characterId === c.id),
    );
  }, [state, turnActions, members, userId]);

  // Boucle de l'hôte : traite la file d'actions.
  useEffect(() => {
    if (!isHost || !room || busyRef.current || status !== 'connecte') return;
    const charReqs = actions.filter((a) => a.kind === 'character');
    if (charReqs.length) return addCharacters(room, charReqs);
    const movements = actions.filter((a) => a.kind === 'map_move');
    if (movements.length) {
      let next = room.state;
      const accepted: number[] = [], rejected: number[] = [];
      for (const req of movements) {
        const owned = next.characters.filter((c) => c.playerId === req.playerId).map((c) => c.id);
        const result = moveOnMap(next, req.payload as MapMoveInput, owned);
        if (result.error) { rejected.push(req.id); if (req.playerId === userId) setError(result.error); }
        else { next = result.state; accepted.push(req.id); }
      }
      if (rejected.length) {
        send({ t: 'retirer', ids: rejected, reason: 'rejetee' });
        setActions((list) => list.filter((a) => !rejected.includes(a.id)));
      }
      commit(next, room.undo, accepted, true);
      return;
    }
    if (paused || !turnActions.length) return;
    const xcard = turnActions.find((a) => a.kind === 'xcard');
    if (xcard) {
      void resolve(room, [xcard], [xcard.payload as PlayerAction]);
      return;
    }
    if (room.state.turnMode === 'libre') {
      const first = turnActions[0];
      void resolve(room, [first], [first.payload as PlayerAction]);
      return;
    }
    if (waitingFor.length === 0) void resolve(room, turnActions, turnActions.map((a) => a.payload as PlayerAction));
  }, [isHost, room, actions, turnActions, waitingFor, paused, status, resolve, addCharacters, commit, send, hostId, userId]);

  const controlledIds = useMemo(() => (state ? state.characters.filter((c) => c.playerId === userId).map((c) => c.id) : []), [state, userId]);

  const pending: PendingAction[] = useMemo(
    () =>
      turnActions.map((a) => {
        const p = a.payload as PlayerAction;
        return { id: a.id, characterId: p.characterId, characterName: state?.characters.find((c) => c.id === p.characterId)?.name ?? '?', text: p.text, kind: p.kind };
      }),
    [turnActions, state],
  );

  const undo = room?.undo ?? [];
  const hostOnline = members.some((m) => m.playerId === hostId && m.online);

  return {
    mode: 'online',
    code,
    state: state ?? (placeholder as GameState),
    // pendant que l'hôte résout un tour, les autres voient la narration en direct et attendent
    busy: isHost ? busy : !!live,
    live,
    dice,
    error,
    isHost,
    controlledIds,
    pending: state?.turnMode === 'tour' ? pending : busy ? [] : pending,
    waitingFor: waitingFor.map((c) => c.name),
    canUndo: isHost && undo.length > 0 && !busy,
    inviteUrl: inviteUrl(code),
    loading: !room && !loadError,
    loadError,
    status,
    members,
    userId,
    hostOnline,
    hasCharacter: controlledIds.length > 0,
    characterRequested: requested || actions.some((a) => a.kind === 'character' && a.playerId === userId),
    async submit(action) {
      setError(null);
      send({ t: 'action', kind: action.kind, payload: action });
    },
    async moveOnMap(move) {
      if (status !== 'connecte' || (isHost ? busyRef.current : !!live) || !hostOnline) {
        setError('Attendez que l’hôte soit connecté et que le MJ ait terminé.'); return;
      }
      send({ t: 'action', kind: 'map_move', payload: move });
    },
    async withdraw(id) {
      send({ t: 'retirer', ids: [Number(id)] });
    },
    async requestCharacter(input) {
      send({ t: 'action', kind: 'character', payload: input });
      setRequested(true);
    },
    takeOver() {
      send({ t: 'prendre-main' });
    },
    async undo() {
      if (!room || !undo.length) return;
      const last = undo[undo.length - 1];
      commit(last.state, undo.slice(0, -1));
    },
    async regenerate() {
      if (!room || !undo.length) return;
      const last = undo[undo.length - 1];
      await resolve({ state: last.state, undo: undo.slice(0, -1) }, [], last.actions);
    },
    async replaceState(next) {
      if (!room) return;
      commit({ ...next, updatedAt: new Date().toISOString() }, [...undo, { state: room.state, actions: [] }]);
    },
    async setTurnMode(mode: TurnMode) {
      if (!room) return;
      commit({ ...room.state, turnMode: mode }, undo);
    },
    async resolvePending() {
      if (!room || busyRef.current) return;
      setPaused(false);
      if (turnActions.length) await resolve(room, turnActions, turnActions.map((a) => a.payload as PlayerAction));
    },
    dismissError: () => setError(null),
  };
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
