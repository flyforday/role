import { describe, expect, it } from 'vitest';
import { mapTokens, moveOnMap } from '@veillee/engine';
import { StateChangeSchema } from './schema';
import { sampleState } from './fixtures.test-utils';
import { stateExtract } from './context';
import { exportSave, importSave } from './savefile';

describe('carte dans les prompts et les sauvegardes', () => {
  it('valide les deux nouvelles opérations et rejette les coordonnées et terrains inconnus', () => {
    expect(StateChangeSchema.safeParse({ op: 'map_position', target: 'marek', x: 5, y: 2 }).success).toBe(true);
    expect(StateChangeSchema.safeParse({ op: 'map_tiles', location_id: 'quai', tiles: [{ x: 5, y: 2, terrain: 'porte' }] }).success).toBe(true);
    for (const change of [
      { op: 'map_position', target: 'marek', x: 14, y: 2 },
      { op: 'map_position', target: 'marek', x: 2.5, y: 2 },
      { op: 'map_tiles', location_id: 'quai', tiles: [{ x: 1, y: 1, terrain: 'lave' }] },
      { op: 'map_tiles', location_id: 'quai', tiles: Array.from({ length: 25 }, () => ({ x: 1, y: 1, terrain: 'sol' })) },
    ]) expect(StateChangeSchema.safeParse(change).success).toBe(false);
  });
  it('conserve la carte dans l’export et fournit les coordonnées au MJ sans les secrets', () => {
    const s = sampleState(), pc = mapTokens(s).find((t) => t.id === s.characters[0].id)!;
    const moved = moveOnMap(s, { characterId: pc.id, locationId: s.currentLocationId!, fromX: pc.x, fromY: pc.y, x: pc.x + 1, y: pc.y }, [pc.id]);
    expect(moved.error).toBeUndefined();
    expect(importSave(exportSave(moved.state)).maps).toEqual(moved.state.maps);
    expect(stateExtract(s)).toContain('CARTE DU LIEU');
    // Le plan n’ajoute aucun secret du PNJ aux pions publics.
    expect(JSON.stringify(mapTokens(s))).not.toContain('Payé par les passeurs');
    expect(importSave(exportSave(s)).maps).toBeUndefined();
  });
});
