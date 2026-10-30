import type { Character, CombatantRef, Enemy, GameState } from './types';
import { rollDice, rollDie, parseDice, type Rng } from './dice';
import { clamp, grantXp, normalize, weaponOf } from './rules';
import { makeId } from './ids';

export interface EnemyInput {
  name: string;
  hp: number;
  attack?: number;
  defense?: number;
  damage?: string;
  initiative?: number;
  xp?: number;
}

export interface AttackEvent {
  kind: 'attack';
  attackerId: string;
  attackerName: string;
  targetId: string;
  targetName: string;
  natural: number;
  bonus: number;
  total: number;
  defense: number;
  hit: boolean;
  critical: boolean;
  damage: number;
  damageRolls: number[];
  targetHp: number;
  targetMaxHp: number;
  text: string;
}

export interface InfoEvent {
  kind: 'info';
  text: string;
}

export type CombatEvent = AttackEvent | InfoEvent;

/** Borne les statistiques d'un ennemi proposé par l'IA. */
export function sanitizeEnemy(input: EnemyInput, index: number): Enemy {
  const hp = clamp(Math.round(input.hp || 6), 1, 120);
  const damage = input.damage && parseDice(input.damage) ? input.damage : '1d6';
  return {
    id: makeId(`enn${index}`),
    name: (input.name || `Ennemi ${index + 1}`).slice(0, 60),
    hp,
    maxHp: hp,
    attack: clamp(Math.round(input.attack ?? 2), -2, 8),
    defense: clamp(Math.round(input.defense ?? 11), 6, 22),
    damage,
    initiative: clamp(Math.round(input.initiative ?? 0), -2, 6),
    xp: clamp(Math.round(input.xp ?? hp * 3), 0, 150),
  };
}

export function isConscious(pc: Character): boolean {
  return pc.hp > 0 && !pc.conditions.some((c) => normalize(c) === 'inconscient');
}

/** Démarre un combat : le code lance l'initiative (1d20 + Agilité pour les PJ). */
export function startCombat(input: GameState, enemyInputs: EnemyInput[], rng: Rng): { state: GameState; events: string[] } {
  const state = structuredClone(input);
  const enemies = enemyInputs.map(sanitizeEnemy);
  const order: CombatantRef[] = [
    ...state.characters.map((c) => ({ id: c.id, kind: 'pc' as const, initiative: rollDie(20, rng) + c.abilities.agilite })),
    ...enemies.map((e) => ({ id: e.id, kind: 'enemy' as const, initiative: rollDie(20, rng) + e.initiative })),
  ].sort((a, b) => b.initiative - a.initiative);
  state.combat = { round: 1, order, enemies };
  const names = order.map((o) => `${nameOf(state, o.id)} (${o.initiative})`).join(', ');
  return { state, events: [`Le combat commence ! Initiative : ${names}.`] };
}

export function nameOf(state: GameState, id: string): string {
  return state.characters.find((c) => c.id === id)?.name ?? state.combat?.enemies.find((e) => e.id === id)?.name ?? id;
}

export interface PlayerAttack {
  characterId: string;
  targetId: string;
}

const ATTACK_WORDS = /\b(attaqu\w*|frapp\w*|cogn\w*|poignard\w*|tranch\w*|transperc\w*|embroch\w*|egorg\w*|estoqu\w*|assomm\w*|tir\w* sur|lanc\w* (?:ma|mon|mes|une|un|sa|son) \w+ sur|decoch\w*|charg\w*|riposte\w*|abat\w*|plant\w* (?:ma|mon|mes) \w+)\b/;

/**
 * Reconnaît une attaque décrite en texte libre pendant un combat (« je frappe Bodin avec mes dagues »).
 * Renvoie l'ennemi visé (nommé dans le texte, sinon le premier debout), ou null si le texte ne décrit pas une attaque.
 */
export function attackFromText(state: GameState, text: string): Enemy | null {
  if (!state.combat) return null;
  const t = normalize(text);
  if (!ATTACK_WORDS.test(t)) return null;
  const alive = state.combat.enemies.filter((e) => e.hp > 0);
  const named = alive.find((e) => normalize(e.name).split(/[^a-z0-9]+/).some((w) => w.length > 3 && t.includes(w)));
  return named ?? alive[0] ?? null;
}

/**
 * Résout un round complet dans l'ordre d'initiative : les PJ qui ont déclaré une attaque et les compagnons frappent,
 * et chaque ennemi encore debout attaque un PJ conscient choisi au hasard.
 */
export function resolveRound(input: GameState, attacks: PlayerAttack[], rng: Rng): { state: GameState; events: CombatEvent[] } {
  let state = structuredClone(input);
  const events: CombatEvent[] = [];
  if (!state.combat) return { state, events: [{ kind: 'info', text: 'Aucun combat en cours.' }] };

  for (const ref of state.combat.order) {
    if (!state.combat) break;
    if (ref.kind === 'pc') {
      const pc = state.characters.find((c) => c.id === ref.id);
      // un compagnon PNJ attaque de lui-même le premier ennemi encore debout
      const attack = attacks.find((a) => a.characterId === ref.id) ?? (pc?.companion ? { characterId: ref.id, targetId: '' } : undefined);
      if (!attack) continue;
      if (!pc || !isConscious(pc)) continue;
      let target = state.combat.enemies.find((e) => e.id === attack.targetId && e.hp > 0);
      target ??= state.combat.enemies.find((e) => e.hp > 0);
      if (!target) continue;
      events.push(pcAttacks(pc, target, rng));
    } else {
      const enemy = state.combat.enemies.find((e) => e.id === ref.id);
      if (!enemy || enemy.hp <= 0) continue;
      const targets = state.characters.filter(isConscious);
      if (!targets.length) break;
      const target = targets[Math.floor(rng() * targets.length)];
      events.push(enemyAttacks(enemy, target, rng));
    }
    const end = checkCombatEnd(state);
    state = end.state;
    events.push(...end.events.map((text) => ({ kind: 'info' as const, text })));
  }
  if (state.combat) state.combat.round++;
  return { state, events };
}

function pcAttacks(pc: Character, enemy: Enemy, rng: Rng): AttackEvent {
  const weapon = weaponOf(pc);
  const ability = weapon.ability ?? 'force';
  const bonus = pc.abilities[ability] + Math.floor((pc.level - 1) / 2);
  const natural = rollDie(20, rng);
  const total = natural + bonus;
  const critical = natural === 20;
  const hit = critical || (natural !== 1 && total >= enemy.defense);
  let damage = 0;
  let damageRolls: number[] = [];
  if (hit) {
    const roll = rollDice(weapon.damage ?? '1d2', rng, { doubleDice: critical });
    damageRolls = roll.rolls;
    damage = Math.max(1, roll.total + Math.max(0, pc.abilities[ability]));
    enemy.hp = Math.max(0, enemy.hp - damage);
  }
  const text = hit
    ? `${pc.name} frappe ${enemy.name} avec ${weapon.name} (${natural}+${bonus}=${total} contre ${enemy.defense})${critical ? ' — COUP CRITIQUE' : ''} : ${damage} dégâts (${enemy.hp}/${enemy.maxHp} PV).`
    : `${pc.name} manque ${enemy.name} (${natural}+${bonus}=${total} contre ${enemy.defense})${natural === 1 ? ' — échec critique' : ''}.`;
  return {
    kind: 'attack',
    attackerId: pc.id,
    attackerName: pc.name,
    targetId: enemy.id,
    targetName: enemy.name,
    natural,
    bonus,
    total,
    defense: enemy.defense,
    hit,
    critical,
    damage,
    damageRolls,
    targetHp: enemy.hp,
    targetMaxHp: enemy.maxHp,
    text,
  };
}

function enemyAttacks(enemy: Enemy, pc: Character, rng: Rng): AttackEvent {
  const natural = rollDie(20, rng);
  const total = natural + enemy.attack;
  const critical = natural === 20;
  const hit = critical || (natural !== 1 && total >= pc.defense);
  let damage = 0;
  let damageRolls: number[] = [];
  if (hit) {
    const roll = rollDice(enemy.damage, rng, { doubleDice: critical });
    damageRolls = roll.rolls;
    damage = Math.max(1, roll.total);
    pc.hp = Math.max(0, pc.hp - damage);
    if (pc.hp === 0 && !pc.conditions.some((c) => normalize(c) === 'inconscient')) pc.conditions.push('inconscient');
  }
  const text = hit
    ? `${enemy.name} touche ${pc.name} (${natural}+${enemy.attack}=${total} contre ${pc.defense})${critical ? ' — COUP CRITIQUE' : ''} : ${damage} dégâts (${pc.hp}/${pc.maxHp} PV)${pc.hp === 0 ? ', ' + pc.name + ' s\'effondre' : ''}.`
    : `${enemy.name} rate ${pc.name} (${natural}+${enemy.attack}=${total} contre ${pc.defense}).`;
  return {
    kind: 'attack',
    attackerId: enemy.id,
    attackerName: enemy.name,
    targetId: pc.id,
    targetName: pc.name,
    natural,
    bonus: enemy.attack,
    total,
    defense: pc.defense,
    hit,
    critical,
    damage,
    damageRolls,
    targetHp: pc.hp,
    targetMaxHp: pc.maxHp,
    text,
  };
}

/** Termine le combat si tous les ennemis ou tous les PJ sont hors de combat. Victoire : l'XP est partagée. */
export function checkCombatEnd(input: GameState): { state: GameState; events: string[]; outcome: 'victoire' | 'défaite' | null } {
  if (!input.combat) return { state: input, events: [], outcome: null };
  const state = structuredClone(input);
  const combat = state.combat!;
  if (combat.enemies.every((e) => e.hp <= 0)) {
    const totalXp = combat.enemies.reduce((s, e) => s + e.xp, 0);
    const share = state.characters.length ? Math.floor(totalXp / state.characters.length) : 0;
    const events = [`Victoire ! Tous les ennemis sont vaincus. Chaque personnage gagne ${share} XP.`];
    for (const pc of state.characters) events.push(...grantXp(state, pc.id, share));
    state.combat = null;
    state.flags['dernier_combat'] = 'victoire';
    return { state, events, outcome: 'victoire' };
  }
  if (state.characters.length && state.characters.every((c) => !isConscious(c))) {
    state.combat = null;
    state.flags['dernier_combat'] = 'défaite';
    return { state, events: ['Défaite… tous les personnages sont hors de combat.'], outcome: 'défaite' };
  }
  return { state, events: [], outcome: null };
}
