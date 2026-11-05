import { describe, expect, it } from 'vitest';
import { createCharacter } from '@veillee/engine';
import { sampleState } from './fixtures.test-utils';
import { exportSave, importSave } from './savefile';
import { stateExtract } from './context';

describe('identité du personnage dans les sauvegardes et le contexte', () => {
  it('conserve classe, race et portrait après export puis import', () => {
    const state = sampleState();
    const c = createCharacter({ name: 'Mira', concept: 'Mage', classId: 'mage', raceId: 'demi-elfe', portraitId: 'demi-elfe-2', background: '', abilities: { force: 1, agilite: 1, endurance: 1, intelligence: 1, perception: 1, charisme: 1 } });
    state.characters = [c];
    expect(importSave(exportSave(state)).characters[0]).toEqual(c);
    expect(stateExtract(state)).toContain('Race : Demi-elfe');
    expect(stateExtract(state)).not.toContain('demi-elfe-2');
  });

  it('importe toujours les personnages d’avant les portraits', () => {
    const state = sampleState();
    const c = importSave(exportSave(state)).characters[0];
    expect(c.name).toBe(state.characters[0].name);
    expect(c.raceId).toBeUndefined();
    expect(c.portraitId).toBeUndefined();
  });
});
