import { describe, expect, it } from 'vitest';
import { CHARACTER_CLASSES, CUSTOM_CLASS_ID } from './archetypes';
import { CHARACTER_RACES, portraitsForRace, resolvePortrait } from './ancestries';
import { createCharacter, STARTING_WEAPONS, validateAbilities, type NewCharacterInput } from './rules';

const input: NewCharacterInput = {
  name: 'Mira', concept: 'Mage', background: '',
  abilities: { force: 1, agilite: 1, endurance: 1, intelligence: 1, perception: 1, charisme: 1 },
};

describe('classes, races et portraits', () => {
  it('propose des classes avec des caractéristiques et des armes autorisées', () => {
    expect(new Set(CHARACTER_CLASSES.map((c) => c.id)).size).toBe(16);
    for (const entry of CHARACTER_CLASSES) {
      expect(validateAbilities(entry.abilities), entry.name).toEqual([]);
      expect(STARTING_WEAPONS.some((weapon) => weapon.id === entry.weaponId)).toBe(true);
    }
  });

  it('propose exactement deux portraits distincts pour chacune des douze races', () => {
    expect(new Set(CHARACTER_RACES.map((r) => r.id)).size).toBe(12);
    const ids = CHARACTER_RACES.flatMap((race) => {
      const portraits = portraitsForRace(race.id);
      expect(portraits).toHaveLength(2);
      expect(portraits.map(resolvePortrait)).toEqual([{ raceId: race.id, index: 0 }, { raceId: race.id, index: 1 }]);
      return portraits;
    });
    expect(new Set(ids).size).toBe(24);
  });

  it('permet le même portrait avec toutes les classes, sans changer les règles', () => {
    const before = createCharacter(input);
    for (const entry of CHARACTER_CLASSES) {
      const c = createCharacter({ ...input, classId: entry.id, raceId: 'orc', portraitId: 'orc-2' });
      expect(c.classId).toBe(entry.id);
      expect(c.raceId).toBe('orc');
      expect(c.portraitId).toBe('orc-2');
      expect([c.hp, c.defense, c.gold, c.abilities]).toEqual([before.hp, before.defense, before.gold, before.abilities]);
    }
  });

  it('conserve la classe libre et les personnages sans nouveaux champs', () => {
    expect(createCharacter({ ...input, concept: 'Astronome', classId: CUSTOM_CLASS_ID }).concept).toBe('Astronome');
    const legacy = createCharacter(input);
    expect(legacy.raceId).toBeUndefined();
    expect(legacy.portraitId).toBeUndefined();
  });

  it.each([
    { classId: 'inconnue' },
    { raceId: 'inconnue' },
    { raceId: 'elfe', portraitId: 'orc-1' },
    { portraitId: 'orc-1' },
    { raceId: 'orc', portraitId: 'orc-3' },
    { raceId: 'orc', portraitId: 'https://exemple.test/portrait.jpg' },
    { raceId: 'orc', portraitId: 'data:image/svg+xml,test' },
  ])('refuse une identité ou un portrait incohérent : %j', (extra) => {
    expect(() => createCharacter({ ...input, ...extra })).toThrow();
  });

  it('ne résout jamais une URL, un chemin libre ou un identifiant mal formé', () => {
    for (const id of [null, {}, 'orc-0', 'orc-12', '../orc-1', 'inconnu-1', 'https://exemple.test/elfe-1', 'orc-1\n']) {
      expect(resolvePortrait(id)).toBeUndefined();
    }
    expect(portraitsForRace('inconnue')).toEqual([]);
  });
});
