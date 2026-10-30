import { describe, expect, it } from 'vitest';
import { attackFromText, resolveRound, startCombat } from './combat';
import { MAX_COMPANIONS, addCompanions, makeCompanions } from './companions';
import { sampleState } from './fixtures.test-utils';

describe('compagnons PNJ', () => {
  it('sont des personnages valides marqués comme compagnons', () => {
    const list = makeCompanions(5);
    expect(list).toHaveLength(MAX_COMPANIONS);
    for (const c of list) {
      expect(c.companion).toBe(true);
      expect(c.hp).toBeGreaterThan(0);
      expect(c.playerId).toBeUndefined();
    }
  });

  it("s'ajoutent sans doublon", () => {
    const once = addCompanions(sampleState(), 2);
    expect(addCompanions(once, 2).characters).toHaveLength(3);
  });

  it('attaquent seuls pendant un round, même sans action déclarée', () => {
    const base = addCompanions(sampleState(), 1);
    const { state } = startCombat(base, [{ name: 'Rat', hp: 30, attack: 0, defense: 5, damage: '1d2' }], () => 0.5);
    const round = resolveRound(state, [], () => 0.5);
    const attackers = round.events.filter((e) => e.kind === 'attack').map((e) => (e.kind === 'attack' ? e.attackerId : ''));
    expect(attackers).toContain('compagnon-1');
    expect(attackers).not.toContain('pj_lyra');
  });
});

describe('attaque en texte libre', () => {
  const combat = () =>
    startCombat(sampleState(), [{ name: 'Détrousseur', hp: 4 }, { name: 'Bodin des Rois', hp: 6 }], () => 0.5).state;

  it("reconnaît l'ennemi nommé", () => {
    const target = attackFromText(combat(), 'je dégaine mes dagues de manière sûre et frappe rapidement Bodin des rois');
    expect(target?.name).toBe('Bodin des Rois');
  });

  it('vise le premier ennemi debout si aucun nom ne correspond', () => {
    expect(attackFromText(combat(), "J'attaque !")?.name).toBe('Détrousseur');
  });

  it("n'invente pas d'attaque pour une autre action", () => {
    expect(attackFromText(combat(), 'Essayer de fuir vers la sortie')).toBeNull();
    expect(attackFromText(sampleState(), 'Je frappe le mur')).toBeNull();
  });
});
