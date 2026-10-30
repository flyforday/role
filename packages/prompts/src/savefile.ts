import { z } from 'zod';
import type { GameState } from '@veillee/engine';

/** Validation minimale d'une sauvegarde importée (structure générale, pas chaque champ). */
const SaveSchema = z
  .object({
    version: z.literal(1),
    id: z.string().min(1),
    campaign: z.object({ title: z.string(), lines: z.array(z.string()), veils: z.array(z.string()) }).passthrough(),
    characters: z.array(z.object({ id: z.string(), name: z.string(), hp: z.number(), maxHp: z.number(), inventory: z.array(z.any()) }).passthrough()),
    npcs: z.array(z.any()),
    locations: z.array(z.any()),
    quests: z.array(z.any()),
    flags: z.record(z.union([z.string(), z.number(), z.boolean()])),
    log: z.array(z.any()),
    turn: z.number(),
  })
  .passthrough();

export interface SaveFile {
  format: 'veillee-sauvegarde';
  exportedAt: string;
  state: GameState;
}

export function exportSave(state: GameState): string {
  const file: SaveFile = { format: 'veillee-sauvegarde', exportedAt: new Date().toISOString(), state };
  return JSON.stringify(file, null, 2);
}

export function importSave(text: string): GameState {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Le fichier n'est pas un JSON valide.");
  }
  const candidate = (data as { format?: string; state?: unknown })?.format === 'veillee-sauvegarde' ? (data as SaveFile).state : data;
  const parsed = SaveSchema.safeParse(candidate);
  if (!parsed.success) throw new Error(`Sauvegarde invalide : ${parsed.error.issues[0]?.path.join('.')} ${parsed.error.issues[0]?.message}`);
  const state = parsed.data as unknown as GameState;
  // valeurs ajoutées par des versions plus récentes
  state.summary ??= '';
  state.summarizedThroughTurn ??= 0;
  state.lore ??= [];
  state.memoryNotes ??= [];
  state.pendingRejections ??= [];
  state.suggestedActions ??= [];
  state.combat ??= null;
  state.turnMode ??= 'libre';
  return state;
}
