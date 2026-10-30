import { describe, expect, it } from 'vitest';
import { checkCombatEnd, resolveRound, sanitizeEnemy, startCombat } from './combat';
import { seededRng } from './dice';
import { sampleState } from './fixtures.test-utils';

const fixed = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe('combat', () => {
  it('borne les ennemis proposés par l\'IA', () => {
    const e = sanitizeEnemy({ name: 'Dragon', hp: 9999, attack: 50, defense: 99, damage: 'n\'importe quoi' }, 0);
    expect(e.hp).toBe(120);
    expect(e.attack).toBe(8);
    expect(e.defense).toBe(22);
    expect(e.damage).toBe('1d6');
  });

  it('trie l\'initiative', () => {
    const { state } = startCombat(sampleState(), [{ name: 'Rat', hp: 3 }, { name: 'Rat', hp: 3 }], seededRng(7));
    const inits = state.combat!.order.map((o) => o.initiative);
    expect([...inits].sort((a, b) => b - a)).toEqual(inits);
  });

  it('résout un round : le PJ touche, l\'ennemi riposte', () => {
    const { state } = startCombat(sampleState(), [{ name: 'Noyé', hp: 20, attack: 2, defense: 10, damage: '1d4' }], fixed(0.99, 0));
    // ordre : PJ (20+3) puis ennemi (1+0)
    expect(state.combat!.order[0].kind).toBe('pc');
    const enemyId = state.combat!.enemies[0].id;
    // PJ : d20=15 touche, dégâts 1d4+2 → 4+2 (+3 agilité) ; ennemi : choix de cible, d20=20 critique, 2d4 → 4+4
    const r = resolveRound(state, [{ characterId: 'pj_lyra', targetId: enemyId }], fixed(0.7, 0.99, 0, 0.99, 0.99, 0.99));
    const attacks = r.events.filter((e) => e.kind === 'attack');
    expect(attacks).toHaveLength(2);
    expect(attacks[0]).toMatchObject({ hit: true, damage: 9 });
    expect(attacks[1]).toMatchObject({ hit: true, critical: true, damage: 8 });
    expect(r.state.combat!.enemies[0].hp).toBe(11);
    expect(r.state.characters[0].hp).toBe(r.state.characters[0].maxHp - 8);
    expect(r.state.combat!.round).toBe(2);
  });

  it('termine le combat par une victoire et distribue l\'XP', () => {
    const { state } = startCombat(sampleState(), [{ name: 'Rat', hp: 1, xp: 120 }], fixed(0.99, 0));
    const r = resolveRound(state, [{ characterId: 'pj_lyra', targetId: state.combat!.enemies[0].id }], fixed(0.99));
    expect(r.state.combat).toBeNull();
    expect(r.state.characters[0].xp).toBe(120);
    expect(r.state.characters[0].level).toBe(2);
    expect(r.state.flags.dernier_combat).toBe('victoire');
  });

  it('détecte la défaite', () => {
    const { state } = startCombat(sampleState(), [{ name: 'Ogre', hp: 50 }], seededRng(1));
    state.characters[0].hp = 0;
    state.characters[0].conditions.push('inconscient');
    const r = checkCombatEnd(state);
    expect(r.outcome).toBe('défaite');
    expect(r.state.combat).toBeNull();
  });
});
