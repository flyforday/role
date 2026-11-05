import { describe, expect, it } from 'vitest';
import { applyChanges, DEFAULT_LIMITS, newBudget, type StateChange } from './changes';
import { sampleState } from './fixtures.test-utils';
import { MAP_HEIGHT, MAP_WIDTH, mapTokens, moveOnMap, sceneMap, storeSceneMap, type MapMoveInput } from './map';

function fixture() {
  const s = sampleState();
  const map = sceneMap(s);
  map.tiles.forEach((t) => { t.terrain = 'sol'; });
  map.positions.pj_lyra = { x: 2, y: 2 };
  map.positions.marek = { x: 5, y: 5 };
  storeSceneMap(s, map);
  return s;
}
const move = (extra: Partial<MapMoveInput> = {}): MapMoveInput => ({ characterId: 'pj_lyra', locationId: fixture().currentLocationId!, fromX: 2, fromY: 2, x: 3, y: 2, ...extra });

describe('carte de scène', () => {
  it('affiche un plan et des placements stables sans modifier les anciennes parties', () => {
    const s = sampleState(), before = structuredClone(s);
    expect(sceneMap(s).tiles).toHaveLength(MAP_WIDTH * MAP_HEIGHT);
    expect(mapTokens(s)).toEqual(mapTokens(s));
    expect(s).toEqual(before);
    expect(mapTokens(s).map((t) => t.name)).toContain('Marek');
  });
  it('ne révèle ni PNJ distant ni PNJ mort', () => {
    const s = fixture(); s.npcs[0].locationId = 'ailleurs';
    expect(mapTokens(s).some((t) => t.id === 'marek')).toBe(false);
    s.npcs[0].locationId = s.currentLocationId!; s.npcs[0].status = 'mort';
    expect(mapTokens(s).some((t) => t.id === 'marek')).toBe(false);
  });
  it('déplace une case sans changer le tour, les PV ou l’entrée', () => {
    const s = fixture(), before = structuredClone(s);
    const result = moveOnMap(s, move(), ['pj_lyra']);
    expect(result.error).toBeUndefined();
    expect(mapTokens(result.state).find((t) => t.id === 'pj_lyra')).toMatchObject({ x: 3, y: 2 });
    expect(result.state.characters).toEqual(s.characters);
    expect(result.state.turn).toBe(s.turn);
    expect(s).toEqual(before);
  });
  it.each([
    { x: 9 }, { x: -1 }, { x: 3.5 }, { y: NaN }, { fromX: 1 }, { locationId: 'ailleurs' }, { characterId: 'absent' }, { x: 5, y: 5 },
  ])('refuse téléportation, coordonnées invalides, requête obsolète ou cible absente : %j', (extra) => {
    expect(moveOnMap(fixture(), move(extra), ['pj_lyra']).error).toBeTruthy();
  });
  it('refuse de déplacer autrui, un obstacle, un personnage inconscient ou en combat', () => {
    const s = fixture();
    expect(moveOnMap(s, move(), []).error).toMatch(/contrôlez/);
    s.maps![s.currentLocationId!].tiles.find((t) => t.x === 3 && t.y === 2)!.terrain = 'mur';
    expect(moveOnMap(s, move(), ['pj_lyra']).error).toMatch(/obstacle/);
    s.characters[0].hp = 0;
    expect(moveOnMap(s, move(), ['pj_lyra']).error).toMatch(/peut pas/);
    s.combat = { round: 1, order: [], enemies: [] };
    expect(moveOnMap(s, move(), ['pj_lyra']).error).toMatch(/combat/);
  });
  it('préserve les positions lors de l’arrivée d’un personnage et du retour dans un lieu', () => {
    const s = fixture(), prior = mapTokens(s);
    s.characters.push({ ...s.characters[0], id: 'nouveau' });
    for (const token of prior) expect(mapTokens(s).find((t) => t.id === token.id)).toMatchObject({ x: token.x, y: token.y });
    const old = s.currentLocationId; s.currentLocationId = 'ailleurs';
    storeSceneMap(s, sceneMap(s)); s.currentLocationId = old;
    expect(mapTokens(s).find((t) => t.id === 'marek')).toMatchObject({ x: 5, y: 5 });
  });
  it('refuse le second mouvement simultané vers une case déjà prise', () => {
    const s = fixture();
    s.characters.push({ ...s.characters[0], id: 'pj_ami' });
    s.maps![s.currentLocationId!].positions.pj_ami = { x: 4, y: 2 };
    const first = moveOnMap(s, move(), ['pj_lyra']);
    const second = moveOnMap(first.state, move({ characterId: 'pj_ami', fromX: 4, x: 3 }), ['pj_ami']);
    expect(first.error).toBeUndefined();
    expect(second.error).toMatch(/obstacle/);
    expect(second.state).toEqual(first.state);
  });
  it('ignore les cases et positions importées mal formées', () => {
    const s = fixture();
    s.maps![s.currentLocationId!] = JSON.parse('{"tiles":[{"x":500,"y":1,"terrain":"mur"}],"positions":{"pj_lyra":{"x":null,"y":-1}}}');
    expect(mapTokens(s).every((t) => Number.isInteger(t.x) && t.x < MAP_WIDTH)).toBe(true);
  });
});

describe('propositions de carte du MJ', () => {
  it('applique le décor et le déplacement d’un PNJ avec un chemin libre', () => {
    const s = fixture();
    const r = applyChanges(s, [{ op: 'map_tiles', location_id: s.currentLocationId!, tiles: [{ x: 1, y: 1, terrain: 'arbre' }] }, { op: 'map_position', target: 'marek', x: 6, y: 5 }]);
    expect(r.rejected).toEqual([]);
    expect(mapTokens(r.state).find((t) => t.id === 'marek')).toMatchObject({ x: 6, y: 5 });
    expect(sceneMap(r.state).tiles.find((t) => t.x === 1 && t.y === 1)?.terrain).toBe('arbre');
  });
  it.each([
    { op: 'map_tiles', location_id: 'ailleurs', tiles: [{ x: 1, y: 1, terrain: 'sol' }] },
    { op: 'map_tiles', location_id: fixture().currentLocationId!, tiles: [{ x: 2, y: 2, terrain: 'mur' }] },
    { op: 'map_tiles', location_id: fixture().currentLocationId!, tiles: [{ x: 14, y: 2, terrain: 'sol' }] },
    { op: 'map_tiles', location_id: fixture().currentLocationId!, tiles: [{ x: 1, y: 1, terrain: 'lave' }] },
    { op: 'map_position', target: 'pj_lyra', x: 3, y: 2 },
    { op: 'map_position', target: 'absent', x: 1, y: 1 },
    { op: 'map_position', target: 'marek', x: 13, y: 9 },
    { op: 'map_position', target: 'marek', x: 5.5, y: 5 },
  ])('refuse une proposition incohérente : %j', (change) => {
    expect(applyChanges(fixture(), [change as StateChange]).rejected).toHaveLength(1);
  });
  it('refuse un PNJ mort, une collision et les changements de carte en combat', () => {
    const s = fixture(); s.npcs[0].status = 'mort';
    expect(applyChanges(s, [{ op: 'map_position', target: 'marek', x: 6, y: 5 }]).rejected).toHaveLength(1);
    s.npcs[0].status = 'vivant';
    expect(applyChanges(s, [{ op: 'map_position', target: 'marek', x: 2, y: 2 }]).rejected).toHaveLength(1);
    s.combat = { round: 1, order: [], enemies: [] };
    expect(applyChanges(s, [{ op: 'map_position', target: 'marek', x: 6, y: 5 }, { op: 'map_tiles', location_id: s.currentLocationId!, tiles: [{ x: 1, y: 1, terrain: 'mur' }] }]).rejected).toHaveLength(2);
  });
  it('partage les budgets de décor et de déplacement entre plusieurs réponses du MJ', () => {
    const s = fixture(), budget = newBudget();
    const first = applyChanges(s, [{ op: 'map_position', target: 'marek', x: 11, y: 5 }], { budget });
    expect(first.applied).toHaveLength(1);
    expect(applyChanges(first.state, [{ op: 'map_position', target: 'marek', x: 12, y: 5 }], { budget }).rejected).toHaveLength(1);
    const tiles = Array.from({ length: DEFAULT_LIMITS.maxMapTilesPerTurn }, () => ({ x: 1, y: 1, terrain: 'sol' as const }));
    const next = applyChanges(s, [{ op: 'map_tiles', location_id: s.currentLocationId!, tiles }], { budget });
    expect(next.applied).toHaveLength(1);
    expect(applyChanges(next.state, [{ op: 'map_tiles', location_id: s.currentLocationId!, tiles: tiles.slice(0, 1) }], { budget }).rejected).toHaveLength(1);
  });
});
