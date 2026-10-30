import { z } from 'zod';
import { ABILITIES, DIFFICULTIES, type Ability, type StateChange } from '@veillee/engine';
import { normalize } from '@veillee/engine';

/** Convertit « Agilité », « AGILITE », « dex »… vers une caractéristique connue. */
export function normalizeAbility(value: unknown): Ability | unknown {
  if (typeof value !== 'string') return value;
  const n = normalize(value);
  const aliases: Record<string, Ability> = {
    str: 'force',
    strength: 'force',
    dex: 'agilite',
    dexterity: 'agilite',
    agility: 'agilite',
    con: 'endurance',
    constitution: 'endurance',
    int: 'intelligence',
    wis: 'perception',
    sagesse: 'perception',
    cha: 'charisme',
    charisma: 'charisme',
  };
  return (ABILITIES as readonly string[]).includes(n) ? n : (aliases[n] ?? value);
}

/** Ramène une difficulté vers la valeur autorisée la plus proche (8, 12, 16, 20). */
export function normalizeDifficulty(value: unknown): unknown {
  const n = typeof value === 'string' ? Number(value) : value;
  if (typeof n !== 'number' || !Number.isFinite(n)) return value;
  return DIFFICULTIES.reduce((best, d) => (Math.abs(d - n) < Math.abs(best - n) ? d : best), DIFFICULTIES[0]);
}

const abilitySchema = z.preprocess(normalizeAbility, z.enum(ABILITIES));
const intLike = z.preprocess((v) => (typeof v === 'string' && v.trim() !== '' ? Number(v) : v), z.number().finite());
const str = z.string().trim();

export const RollRequestSchema = z.object({
  character_id: str.min(1),
  ability: abilitySchema,
  difficulty: z.preprocess(normalizeDifficulty, z.union([z.literal(8), z.literal(12), z.literal(16), z.literal(20)])),
  reason: str.default(''),
});
export type RollRequest = z.infer<typeof RollRequestSchema>;

const ItemSchema = z.object({
  name: str.min(1),
  description: str.optional(),
  damage: str.optional(),
  ability: abilitySchema.optional(),
  quantity: intLike.optional(),
});

const EnemySchema = z.object({
  name: str.min(1),
  hp: intLike,
  attack: intLike.optional(),
  defense: intLike.optional(),
  damage: str.optional(),
  initiative: intLike.optional(),
  xp: intLike.optional(),
});

export const StateChangeSchema = z.discriminatedUnion('op', [
  z.object({ op: z.literal('hp'), target: str.min(1), delta: intLike, reason: str.optional() }),
  z.object({ op: z.literal('add_item'), target: str.min(1), item: ItemSchema }),
  z.object({ op: z.literal('remove_item'), target: str.min(1), item_name: str.min(1), quantity: intLike.optional() }),
  z.object({ op: z.literal('gold'), target: str.min(1), delta: intLike, reason: str.optional() }),
  z.object({ op: z.literal('condition'), target: str.min(1), add: str.optional(), remove: str.optional() }),
  z.object({
    op: z.literal('move'),
    location_id: str.min(1),
    new_location: z.object({ name: str.min(1), description: str.optional() }).nullish().transform((v) => v ?? undefined),
    reason: str.optional(),
  }),
  z.object({
    op: z.literal('npc'),
    npc: z.object({
      id: str.min(1),
      name: str.optional(),
      description: str.optional(),
      attitude: str.optional(),
      status: z.enum(['vivant', 'mort']).optional(),
      secret: str.optional(),
    }),
  }),
  z.object({
    op: z.literal('quest'),
    quest: z.object({
      id: str.min(1),
      title: str.optional(),
      objective: str.optional(),
      status: z.enum(['active', 'réussie', 'échouée']).optional(),
      clue: str.optional(),
    }),
  }),
  z.object({ op: z.literal('flag'), key: str.min(1), value: z.union([z.string(), z.number(), z.boolean()]) }),
  z.object({ op: z.literal('xp'), target: str.min(1), delta: intLike, reason: str.optional() }),
  z.object({ op: z.literal('start_combat'), enemies: z.array(EnemySchema).min(1) }),
  z.object({ op: z.literal('end_combat'), reason: str.optional() }),
  z.object({ op: z.literal('scene'), scene_id: str.min(1) }),
]);

/** Enveloppe de la réponse du MJ. Les changements sont validés un par un pour ne rejeter que les fautifs. */
export const GmResponseEnvelopeSchema = z.object({
  narration: z.string().min(1),
  roll_request: z.unknown().optional().nullable(),
  state_changes: z.array(z.unknown()).nullish().transform((v) => v ?? []),
  memory_notes: z.array(z.string()).nullish().transform((v) => v ?? []),
  suggested_actions: z.array(z.string()).nullish().transform((v) => (v ?? []).slice(0, 4)),
});

export interface GmResponse {
  narration: string;
  roll_request: RollRequest | null;
  state_changes: StateChange[];
  memory_notes: string[];
  suggested_actions: string[];
}

export const WorldProposalSchema = z.object({
  title: str.min(1),
  setting: str.min(1),
  pitch: str.min(1),
  starting_location: z.object({ name: str.min(1), description: str.default('') }),
  npcs: z
    .array(
      z.object({
        id: str.optional(),
        name: str.min(1),
        description: str.default(''),
        attitude: str.default('neutre'),
        secret: str.optional(),
      }),
    )
    .default([]),
  quest: z.object({ id: str.optional(), title: str.min(1), objective: str.default('') }),
  lore: z.array(z.object({ keywords: z.array(str).min(1), text: str.min(1) })).default([]),
  opening: str.min(1),
});
export type WorldProposal = z.infer<typeof WorldProposalSchema>;

export const SummarySchema = z.object({ summary: str.min(1) });
