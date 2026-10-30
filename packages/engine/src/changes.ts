import type { Ability, FlagValue, GameState, Item, Npc, Quest } from './types';
import { clamp, findItem, grantXp, normalize, slugify } from './rules';
import { makeId } from './ids';
import { checkCombatEnd, startCombat, type EnemyInput } from './combat';
import type { Rng } from './dice';
import { defaultRng } from './dice';

/** Changements que le MJ IA peut proposer. Le code les valide avant de les appliquer. */
export type StateChange =
  | { op: 'hp'; target: string; delta: number; reason?: string }
  | { op: 'add_item'; target: string; item: { name: string; description?: string; damage?: string; ability?: Ability; quantity?: number } }
  | { op: 'remove_item'; target: string; item_name: string; quantity?: number }
  | { op: 'gold'; target: string; delta: number; reason?: string }
  | { op: 'condition'; target: string; add?: string; remove?: string }
  | { op: 'move'; location_id: string; new_location?: { name: string; description?: string }; reason?: string }
  | { op: 'npc'; npc: { id: string; name?: string; description?: string; attitude?: string; status?: 'vivant' | 'mort'; secret?: string } }
  | { op: 'quest'; quest: { id: string; title?: string; objective?: string; status?: 'active' | 'réussie' | 'échouée'; clue?: string } }
  | { op: 'flag'; key: string; value: FlagValue }
  | { op: 'xp'; target: string; delta: number; reason?: string }
  | { op: 'start_combat'; enemies: EnemyInput[] }
  | { op: 'end_combat'; reason?: string };

export interface ChangeLimits {
  /** PV perdus au maximum par cible et par tour. */
  maxDamagePerTurn: number;
  /** PV rendus au maximum par cible et par tour. */
  maxHealPerTurn: number;
  maxGoldGainPerTurn: number;
  maxXpPerTurn: number;
  maxItemsPerTurn: number;
  maxChangesPerTurn: number;
  maxEnemies: number;
}

export const DEFAULT_LIMITS: ChangeLimits = {
  maxDamagePerTurn: 15,
  maxHealPerTurn: 20,
  maxGoldGainPerTurn: 200,
  maxXpPerTurn: 150,
  maxItemsPerTurn: 5,
  maxChangesPerTurn: 15,
  maxEnemies: 8,
};

export interface Rejection {
  change: StateChange;
  reason: string;
}

export interface Adjustment {
  change: StateChange;
  note: string;
}

export interface ApplyResult {
  state: GameState;
  applied: StateChange[];
  rejected: Rejection[];
  /** Changements acceptés mais bornés par le code. */
  adjusted: Adjustment[];
  /** Événements notables produits par le code (montée de niveau, inconscience…). */
  events: string[];
}

export interface ApplyOptions {
  limits?: Partial<ChangeLimits>;
  rng?: Rng;
  /** Compteurs déjà consommés ce tour (plusieurs réponses du MJ dans un même tour). */
  budget?: TurnBudget;
}

export interface TurnBudget {
  damage: Record<string, number>;
  heal: Record<string, number>;
  gold: Record<string, number>;
  xp: Record<string, number>;
  items: Record<string, number>;
  changes: number;
}

export function newBudget(): TurnBudget {
  return { damage: {}, heal: {}, gold: {}, xp: {}, items: {}, changes: 0 };
}

const FLAG_KEY_RE = /^[a-z0-9_]{1,48}$/;

/**
 * Applique les changements proposés par l'IA. Fonction pure : l'état d'entrée n'est jamais modifié.
 * Tout changement incohérent est refusé avec une raison, les valeurs excessives sont bornées.
 */
export function applyChanges(input: GameState, changes: StateChange[], options: ApplyOptions = {}): ApplyResult {
  const limits = { ...DEFAULT_LIMITS, ...options.limits };
  const rng = options.rng ?? defaultRng;
  const budget = options.budget ?? newBudget();
  let state: GameState = structuredClone(input);
  const applied: StateChange[] = [];
  const rejected: Rejection[] = [];
  const adjusted: Adjustment[] = [];
  const events: string[] = [];

  const reject = (change: StateChange, reason: string) => rejected.push({ change, reason });

  for (const change of changes) {
    if (budget.changes >= limits.maxChangesPerTurn) {
      reject(change, `trop de changements dans un même tour (max ${limits.maxChangesPerTurn})`);
      continue;
    }
    const before = rejected.length;
    switch (change.op) {
      case 'hp': {
        if (!Number.isFinite(change.delta) || change.delta === 0) {
          reject(change, 'variation de PV nulle ou invalide');
          break;
        }
        const target = findCombatant(state, change.target);
        if (!target) {
          reject(change, `cible inconnue « ${change.target} »`);
          break;
        }
        if (target.kind === 'npc' && target.ref.status === 'mort') {
          reject(change, `${target.ref.name} est mort`);
          break;
        }
        if (target.hp === undefined || target.maxHp === undefined) {
          reject(change, `${target.name} n'a pas de points de vie suivis par le code`);
          break;
        }
        let delta = Math.round(change.delta);
        if (delta < 0) {
          const used = budget.damage[target.id] ?? 0;
          const allowed = limits.maxDamagePerTurn - used;
          if (allowed <= 0) {
            reject(change, `${target.name} a déjà subi le maximum de dégâts pour ce tour`);
            break;
          }
          if (-delta > allowed) {
            adjusted.push({ change, note: `dégâts bornés à ${allowed} (max ${limits.maxDamagePerTurn} par tour)` });
            delta = -allowed;
          }
          budget.damage[target.id] = used - delta;
        } else {
          if (target.hp >= target.maxHp) {
            reject(change, `${target.name} a déjà tous ses PV`);
            break;
          }
          const used = budget.heal[target.id] ?? 0;
          const allowed = Math.min(limits.maxHealPerTurn - used, target.maxHp - target.hp);
          if (allowed <= 0) {
            reject(change, `${target.name} a déjà reçu le maximum de soins pour ce tour`);
            break;
          }
          if (delta > allowed) {
            adjusted.push({ change, note: `soin borné à ${allowed} PV (PV max ${target.maxHp})` });
            delta = allowed;
          }
          budget.heal[target.id] = used + delta;
        }
        const newHp = clamp(target.hp + delta, 0, target.maxHp);
        target.setHp(newHp);
        if (newHp === 0 && target.hp > 0) events.push(...onZeroHp(state, target));
        if (newHp > 0 && target.hp === 0 && target.kind === 'pc') {
          const pc = state.characters.find((c) => c.id === target.id)!;
          pc.conditions = pc.conditions.filter((c) => normalize(c) !== 'inconscient');
          events.push(`${pc.name} reprend connaissance.`);
        }
        break;
      }
      case 'add_item': {
        const pc = state.characters.find((c) => c.id === change.target);
        if (!pc) {
          reject(change, `personnage inconnu « ${change.target} »`);
          break;
        }
        const name = change.item?.name?.trim();
        if (!name) {
          reject(change, "objet sans nom");
          break;
        }
        const used = budget.items[pc.id] ?? 0;
        if (used >= limits.maxItemsPerTurn) {
          reject(change, `trop d'objets reçus ce tour (max ${limits.maxItemsPerTurn})`);
          break;
        }
        budget.items[pc.id] = used + 1;
        const quantity = clamp(Math.round(change.item.quantity ?? 1), 1, 20);
        const existing = findItem(pc, name);
        if (existing && (existing.quantity !== undefined || quantity > 1)) {
          existing.quantity = (existing.quantity ?? 1) + quantity;
        } else if (existing) {
          existing.quantity = 2;
        } else {
          const item: Item = { id: makeId('obj'), name, description: change.item.description };
          if (change.item.damage) item.damage = change.item.damage;
          if (change.item.ability) item.ability = change.item.ability;
          if (quantity > 1) item.quantity = quantity;
          pc.inventory.push(item);
        }
        break;
      }
      case 'remove_item': {
        const pc = state.characters.find((c) => c.id === change.target);
        if (!pc) {
          reject(change, `personnage inconnu « ${change.target} »`);
          break;
        }
        const item = findItem(pc, change.item_name ?? '');
        if (!item) {
          reject(change, `${pc.name} ne possède pas « ${change.item_name} »`);
          break;
        }
        const quantity = Math.max(1, Math.round(change.quantity ?? 1));
        const have = item.quantity ?? 1;
        if (quantity > have) {
          reject(change, `${pc.name} n'a que ${have} « ${item.name} »`);
          break;
        }
        if (have - quantity <= 0) {
          pc.inventory = pc.inventory.filter((i) => i !== item);
          if (pc.weapon && normalize(pc.weapon) === normalize(item.name)) pc.weapon = undefined;
        } else {
          item.quantity = have - quantity;
        }
        break;
      }
      case 'gold': {
        const pc = state.characters.find((c) => c.id === change.target);
        if (!pc) {
          reject(change, `personnage inconnu « ${change.target} »`);
          break;
        }
        let delta = Math.round(change.delta);
        if (!Number.isFinite(delta) || delta === 0) {
          reject(change, "variation d'or nulle ou invalide");
          break;
        }
        if (delta < 0 && pc.gold + delta < 0) {
          reject(change, `${pc.name} n'a que ${pc.gold} pièces d'or`);
          break;
        }
        if (delta > 0) {
          const used = budget.gold[pc.id] ?? 0;
          const allowed = limits.maxGoldGainPerTurn - used;
          if (allowed <= 0) {
            reject(change, `gain d'or maximal atteint pour ce tour`);
            break;
          }
          if (delta > allowed) {
            adjusted.push({ change, note: `gain d'or borné à ${allowed}` });
            delta = allowed;
          }
          budget.gold[pc.id] = used + delta;
        }
        pc.gold += delta;
        break;
      }
      case 'condition': {
        const target = findCombatant(state, change.target);
        if (!target || target.kind === 'enemy') {
          reject(change, `cible inconnue « ${change.target} »`);
          break;
        }
        const list: string[] = target.kind === 'pc' ? target.ref.conditions : (target.ref.conditions ??= []);
        if (!change.add && !change.remove) {
          reject(change, 'condition à ajouter ou retirer manquante');
          break;
        }
        if (change.remove) {
          const idx = list.findIndex((c) => normalize(c) === normalize(change.remove!));
          if (idx === -1) {
            reject(change, `${target.name} n'est pas « ${change.remove} »`);
            break;
          }
          list.splice(idx, 1);
        }
        if (change.add) {
          const cond = change.add.trim().toLowerCase();
          if (!list.some((c) => normalize(c) === normalize(cond))) list.push(cond);
        }
        break;
      }
      case 'move': {
        if (state.combat) {
          reject(change, 'impossible de changer de lieu en plein combat (le combat doit d\'abord se terminer)');
          break;
        }
        const id = change.location_id?.trim();
        if (!id) {
          reject(change, 'lieu de destination manquant');
          break;
        }
        let loc = state.locations.find((l) => l.id === id);
        if (!loc && change.new_location?.name) {
          loc = { id: uniqueId(state.locations.map((l) => l.id), slugify(id)), name: change.new_location.name, description: change.new_location.description };
          state.locations.push(loc);
        }
        if (!loc) {
          reject(change, `lieu inconnu « ${id} » (fournir new_location pour créer un nouveau lieu)`);
          break;
        }
        if (state.currentLocationId === loc.id) {
          reject(change, `le groupe est déjà à ${loc.name}`);
          break;
        }
        state.currentLocationId = loc.id;
        break;
      }
      case 'npc': {
        const data = change.npc;
        if (!data?.id) {
          reject(change, 'PNJ sans identifiant');
          break;
        }
        const existing = state.npcs.find((n) => n.id === data.id) ?? state.npcs.find((n) => data.name && normalize(n.name) === normalize(data.name));
        if (existing) {
          if (existing.status === 'mort' && data.status === 'vivant') {
            reject(change, `${existing.name} est mort et ne peut pas revenir à la vie`);
            break;
          }
          if (data.name) existing.name = data.name;
          if (data.description) existing.description = data.description;
          if (data.attitude) existing.attitude = data.attitude;
          if (data.status) existing.status = data.status;
          if (data.secret) (existing.secrets ??= []).push(data.secret);
          if (state.currentLocationId && existing.status === 'vivant') existing.locationId = state.currentLocationId;
        } else {
          if (!data.name) {
            reject(change, `nouveau PNJ « ${data.id} » sans nom`);
            break;
          }
          const npc: Npc = {
            id: uniqueId(state.npcs.map((n) => n.id), slugify(data.id)),
            name: data.name,
            description: data.description,
            attitude: data.attitude ?? 'neutre',
            status: data.status ?? 'vivant',
            secrets: data.secret ? [data.secret] : [],
            locationId: state.currentLocationId ?? undefined,
          };
          state.npcs.push(npc);
        }
        break;
      }
      case 'quest': {
        const data = change.quest;
        if (!data?.id) {
          reject(change, 'quête sans identifiant');
          break;
        }
        const existing = state.quests.find((q) => q.id === data.id);
        if (existing) {
          if (existing.status !== 'active' && data.status && data.status !== existing.status) {
            reject(change, `la quête « ${existing.title} » est déjà ${existing.status}`);
            break;
          }
          if (data.title) existing.title = data.title;
          if (data.objective) existing.objective = data.objective;
          if (data.status) existing.status = data.status;
          if (data.clue && !existing.clues.includes(data.clue)) existing.clues.push(data.clue);
        } else {
          if (!data.title) {
            reject(change, `nouvelle quête « ${data.id} » sans titre`);
            break;
          }
          const quest: Quest = {
            id: uniqueId(state.quests.map((q) => q.id), slugify(data.id)),
            title: data.title,
            objective: data.objective,
            status: data.status ?? 'active',
            clues: data.clue ? [data.clue] : [],
          };
          state.quests.push(quest);
        }
        break;
      }
      case 'flag': {
        if (!FLAG_KEY_RE.test(change.key ?? '')) {
          reject(change, 'clé de fait invalide (minuscules, chiffres et _ uniquement)');
          break;
        }
        if (!['string', 'number', 'boolean'].includes(typeof change.value)) {
          reject(change, 'valeur de fait invalide');
          break;
        }
        state.flags[change.key] = change.value;
        break;
      }
      case 'xp': {
        const pc = state.characters.find((c) => c.id === change.target);
        if (!pc) {
          reject(change, `personnage inconnu « ${change.target} »`);
          break;
        }
        let delta = Math.round(change.delta);
        if (!Number.isFinite(delta) || delta <= 0) {
          reject(change, "l'XP ne peut qu'augmenter");
          break;
        }
        const used = budget.xp[pc.id] ?? 0;
        const allowed = limits.maxXpPerTurn - used;
        if (allowed <= 0) {
          reject(change, 'gain d\'XP maximal atteint pour ce tour');
          break;
        }
        if (delta > allowed) {
          adjusted.push({ change, note: `gain d'XP borné à ${allowed}` });
          delta = allowed;
        }
        budget.xp[pc.id] = used + delta;
        events.push(...grantXp(state, pc.id, delta));
        break;
      }
      case 'start_combat': {
        if (state.combat) {
          reject(change, 'un combat est déjà en cours');
          break;
        }
        const enemies = (change.enemies ?? []).slice(0, limits.maxEnemies);
        if (!enemies.length) {
          reject(change, 'combat sans ennemi');
          break;
        }
        if ((change.enemies ?? []).length > limits.maxEnemies) {
          adjusted.push({ change, note: `nombre d'ennemis borné à ${limits.maxEnemies}` });
        }
        const started = startCombat(state, enemies, rng);
        state = started.state;
        events.push(...started.events);
        break;
      }
      case 'end_combat': {
        if (!state.combat) {
          reject(change, 'aucun combat en cours');
          break;
        }
        const alive = state.combat.enemies.filter((e) => e.hp > 0);
        if (alive.length) events.push(`Le combat prend fin (${alive.map((e) => e.name).join(', ')} encore debout).`);
        state.combat = null;
        break;
      }
      default: {
        reject(change, `opération inconnue « ${(change as { op?: string }).op} »`);
      }
    }
    if (rejected.length === before) {
      applied.push(change);
      budget.changes++;
    }
  }

  const end = checkCombatEnd(state);
  state = end.state;
  events.push(...end.events);

  return { state, applied, rejected, adjusted, events };
}

interface CombatantView {
  id: string;
  name: string;
  kind: 'pc' | 'npc' | 'enemy';
  hp?: number;
  maxHp?: number;
  setHp: (hp: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: any;
}

function findCombatant(state: GameState, id: string): CombatantView | null {
  const pc = state.characters.find((c) => c.id === id);
  if (pc) return { id, name: pc.name, kind: 'pc', hp: pc.hp, maxHp: pc.maxHp, setHp: (hp) => (pc.hp = hp), ref: pc };
  const enemy = state.combat?.enemies.find((e) => e.id === id);
  if (enemy) return { id, name: enemy.name, kind: 'enemy', hp: enemy.hp, maxHp: enemy.maxHp, setHp: (hp) => (enemy.hp = hp), ref: enemy };
  const npc = state.npcs.find((n) => n.id === id);
  if (npc) return { id, name: npc.name, kind: 'npc', hp: npc.hp, maxHp: npc.maxHp, setHp: (hp) => (npc.hp = hp), ref: npc };
  return null;
}

function onZeroHp(state: GameState, target: CombatantView): string[] {
  if (target.kind === 'pc') {
    const pc = state.characters.find((c) => c.id === target.id)!;
    if (!pc.conditions.some((c) => normalize(c) === 'inconscient')) pc.conditions.push('inconscient');
    return [`${pc.name} tombe à 0 PV et perd connaissance.`];
  }
  if (target.kind === 'npc') {
    const npc = state.npcs.find((n) => n.id === target.id)!;
    npc.status = 'mort';
    return [`${npc.name} succombe.`];
  }
  return [`${target.name} est vaincu.`];
}

function uniqueId(existing: string[], base: string): string {
  if (!existing.includes(base)) return base;
  let i = 2;
  while (existing.includes(`${base}_${i}`)) i++;
  return `${base}_${i}`;
}

/** Résume un rejet en une phrase destinée au MJ. */
export function describeRejection(r: Rejection): string {
  return `Le changement ${JSON.stringify(r.change)} a été refusé car ${r.reason}.`;
}

export function describeAdjustment(a: Adjustment): string {
  return `Le changement ${JSON.stringify(a.change)} a été ajusté : ${a.note}.`;
}
