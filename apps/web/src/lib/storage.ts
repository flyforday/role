import type { GameState } from '@veillee/engine';
import type { PlayerAction } from '@veillee/prompts';
import { importSave } from '@veillee/prompts';

const INDEX = 'veillee:parties';
const gameKey = (id: string) => `veillee:partie:${id}`;
const undoKey = (id: string) => `veillee:annuler:${id}`;

export interface SaveSummary {
  id: string;
  title: string;
  characters: string[];
  turn: number;
  updatedAt: string;
}

export interface UndoEntry {
  state: GameState;
  actions: PlayerAction[];
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function listSaves(): SaveSummary[] {
  return read<SaveSummary[]>(INDEX, []).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function loadGame(id: string): GameState | null {
  const raw = read<unknown>(gameKey(id), null);
  if (!raw) return null;
  try {
    return importSave(JSON.stringify(raw));
  } catch {
    return null;
  }
}

export function saveGame(state: GameState): boolean {
  const ok = write(gameKey(state.id), state);
  const index = listSaves().filter((s) => s.id !== state.id);
  index.push({
    id: state.id,
    title: state.campaign.title,
    characters: state.characters.map((c) => c.name),
    turn: state.turn,
    updatedAt: state.updatedAt,
  });
  write(INDEX, index);
  return ok;
}

export function deleteGame(id: string) {
  write(
    INDEX,
    listSaves().filter((s) => s.id !== id),
  );
  try {
    localStorage.removeItem(gameKey(id));
    localStorage.removeItem(undoKey(id));
  } catch {
    // rien
  }
}

const MAX_UNDO = 8;

export function loadUndo(id: string): UndoEntry[] {
  return read<UndoEntry[]>(undoKey(id), []);
}

export function saveUndo(id: string, stack: UndoEntry[]) {
  // si le stockage est plein, on réduit la pile d'annulation plutôt que de perdre la partie
  let s = stack.slice(-MAX_UNDO);
  while (s.length && !write(undoKey(id), s)) s = s.slice(1);
}

export function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
