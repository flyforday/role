import { describe, expect, it } from 'vitest';
import { createCharacter, levelForXp, maxHpFor, validateAbilities, xpForLevel } from './rules';

describe('règles', () => {
  it('valide la répartition des caractéristiques', () => {
    expect(validateAbilities({ force: 1, agilite: 1, endurance: 1, intelligence: 1, perception: 1, charisme: 1 })).toEqual([]);
    expect(validateAbilities({ force: 3, agilite: 3, endurance: 3, intelligence: 0, perception: 0, charisme: 0 })).toHaveLength(1);
    expect(validateAbilities({ force: 4, agilite: 2, endurance: 0, intelligence: 0, perception: 0, charisme: 0 }).length).toBeGreaterThan(0);
  });

  it('calcule PV et niveaux', () => {
    expect(maxHpFor(1, 0)).toBe(10);
    expect(maxHpFor(1, 3)).toBe(16);
    expect(maxHpFor(3, 1)).toBe(12 + 12);
    expect(xpForLevel(2)).toBe(100);
    expect(levelForXp(99)).toBe(1);
    expect(levelForXp(100)).toBe(2);
    expect(levelForXp(650)).toBe(4);
  });

  it('crée un personnage cohérent', () => {
    const c = createCharacter({
      name: ' Brann ',
      concept: 'Forgeron',
      background: '',
      abilities: { force: 3, agilite: 0, endurance: 2, intelligence: 0, perception: 1, charisme: 0 },
      weaponId: 'arme-hache',
    });
    expect(c.name).toBe('Brann');
    expect(c.maxHp).toBe(14);
    expect(c.hp).toBe(14);
    expect(c.defense).toBe(10);
    expect(c.weapon).toBe('Hache de bataille');
    expect(c.inventory.some((i) => i.name === 'Hache de bataille')).toBe(true);
  });

  it('refuse un personnage invalide', () => {
    expect(() =>
      createCharacter({ name: '', concept: '', background: '', abilities: { force: 0, agilite: 0, endurance: 0, intelligence: 0, perception: 0, charisme: 0 } }),
    ).toThrow();
  });
});
