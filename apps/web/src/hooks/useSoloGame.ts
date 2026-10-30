import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameState, TurnMode } from '@veillee/engine';
import type { PlayerAction } from '@veillee/prompts';
import { emptyLive, errorMessage, playTurn, reduceLive, type GameController, type LiveTurn } from '../lib/controller';
import { createLlm } from '../lib/llm';
import { loadUndo, saveGame, saveUndo, type UndoEntry } from '../lib/storage';

export function useSoloGame(initial: GameState): GameController {
  const [state, setState] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState<LiveTurn | null>(null);
  const [dice, setDice] = useState<GameController['dice']>(null);
  const [error, setError] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<UndoEntry[]>(() => loadUndo(initial.id));
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    saveGame(state);
  }, [state]);
  useEffect(() => {
    saveUndo(state.id, undoStack);
  }, [state.id, undoStack]);

  const run = useCallback(async (base: GameState, actions: PlayerAction[]) => {
    setBusy(true);
    setError(null);
    const pcNames = (id: string) => base.characters.find((c) => c.id === id)?.name ?? 'Joueur';
    let current = emptyLive();
    current.items = actions
      .filter((a) => a.kind !== 'xcard')
      .map((a) => ({ kind: 'player' as const, name: pcNames(a.characterId), text: a.text || 'attaque !' }));
    setLive(current);
    try {
      const result = await playTurn(base, actions, createLlm(base.id), (event) => {
        current = reduceLive(current, event);
        setLive(current);
        if (event.type === 'roll') setDice({ roll: event.roll, characterName: event.characterName, key: Date.now() });
      });
      setUndoStack((s) => [...s, { state: base, actions }].slice(-8));
      setState(result.state);
    } catch (e) {
      setState(base);
      setError(errorMessage(e));
    } finally {
      setLive(null);
      setBusy(false);
    }
  }, []);

  const submit = useCallback(async (action: PlayerAction) => run(stateRef.current, [action]), [run]);

  const undo = useCallback(async () => {
    const last = undoStack[undoStack.length - 1];
    if (!last || busy) return;
    setUndoStack((s) => s.slice(0, -1));
    setState(last.state);
  }, [undoStack, busy]);

  const regenerate = useCallback(async () => {
    const last = undoStack[undoStack.length - 1];
    if (!last || busy) return;
    setUndoStack((s) => s.slice(0, -1));
    await run(last.state, last.actions);
  }, [undoStack, busy, run]);

  return {
    mode: 'solo',
    state,
    busy,
    live,
    dice,
    error,
    isHost: true,
    controlledIds: state.characters.filter((c) => !c.companion).map((c) => c.id),
    pending: [],
    canUndo: undoStack.length > 0 && !busy,
    submit,
    undo,
    regenerate,
    replaceState: async (s) => {
      setUndoStack((st) => [...st, { state: stateRef.current, actions: [] }].slice(-8));
      setState({ ...s, updatedAt: new Date().toISOString() });
    },
    setTurnMode: async (mode: TurnMode) => setState((s) => ({ ...s, turnMode: mode })),
    resolvePending: async () => {},
    dismissError: () => setError(null),
  };
}
