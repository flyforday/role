import type { GameState } from './types';
import { normalize } from './rules';

export const MAP_WIDTH = 14;
export const MAP_HEIGHT = 10;
export const MAP_TERRAINS = ['sol', 'herbe', 'chemin', 'mur', 'eau', 'arbre', 'rocher', 'porte', 'table', 'feu'] as const;
export type MapTerrain = (typeof MAP_TERRAINS)[number];
export interface MapPoint { x: number; y: number }
export interface MapTile extends MapPoint { terrain: MapTerrain }
export interface SceneMap { tiles: MapTile[]; positions: Record<string, MapPoint> }
export interface MapToken extends MapPoint { id: string; name: string; kind: 'pc' | 'npc' | 'enemy'; portraitId?: string; hp?: number }
export interface MapMoveInput extends MapPoint { characterId: string; locationId: string; fromX: number; fromY: number }

export const inMap = (p: MapPoint) => Number.isInteger(p.x) && Number.isInteger(p.y) && p.x >= 0 && p.y >= 0 && p.x < MAP_WIDTH && p.y < MAP_HEIGHT;
export const walkable = (terrain: MapTerrain) => ['sol', 'herbe', 'chemin', 'porte'].includes(terrain);
const same = (a: MapPoint, b: MapPoint) => a.x === b.x && a.y === b.y;

/** Plan indicatif stable pour les lieux anciens ou non encore dessinés par le MJ. */
export function sceneMap(state: GameState): SceneMap {
  const location = state.locations.find((l) => l.id === state.currentLocationId);
  const text = normalize(`${location?.name ?? ''} ${location?.description ?? ''}`);
  const indoor = /auberge|maison|salle|tour|grotte|mine|temple|chapelle|forteresse/.test(text);
  const wooded = /foret|bois|jardin/.test(text);
  const water = /lac|riviere|mer|rive|port/.test(text) && !indoor;
  const tiles: MapTile[] = [];
  for (let y = 0; y < MAP_HEIGHT; y++) for (let x = 0; x < MAP_WIDTH; x++) {
    const edge = x === 0 || y === 0 || x === MAP_WIDTH - 1 || y === MAP_HEIGHT - 1;
    let terrain: MapTerrain = indoor ? 'sol' : 'herbe';
    if (indoor && edge) terrain = x === 7 && y === 9 ? 'porte' : 'mur';
    else if (indoor && /auberge|taverne/.test(text) && [3, 10].includes(x) && [3, 7].includes(y)) terrain = 'table';
    else if (indoor && /auberge|taverne/.test(text) && x === 12 && y === 1) terrain = 'feu';
    else if (water && y < 2) terrain = 'eau';
    else if (wooded && edge && (x + y) % 2 === 0) terrain = 'arbre';
    else if (!indoor && x === 7) terrain = 'chemin';
    tiles.push({ x, y, terrain });
  }
  const stored = state.maps?.[state.currentLocationId ?? ''];
  // Une sauvegarde importée ne peut pas injecter de coordonnées ou de décors arbitraires.
  if (stored && Array.isArray(stored.tiles)) for (const tile of stored.tiles.slice(0, MAP_WIDTH * MAP_HEIGHT)) {
    if (tile && inMap(tile) && MAP_TERRAINS.includes(tile.terrain)) tiles[tile.y * MAP_WIDTH + tile.x] = { ...tile };
  }
  const positions: Record<string, MapPoint> = Object.create(null);
  if (stored?.positions && typeof stored.positions === 'object') for (const [id, point] of Object.entries(stored.positions).slice(0, 200)) {
    if (point && inMap(point)) positions[id] = { x: point.x, y: point.y };
  }
  return { tiles, positions };
}

export function mapTokens(state: GameState, map = sceneMap(state)): MapToken[] {
  const occupants = [
    ...state.characters.map((c) => ({ id: c.id, name: c.name, kind: 'pc' as const, portraitId: c.portraitId, hp: c.hp })),
    ...state.npcs.filter((n) => n.status === 'vivant' && (!n.locationId || n.locationId === state.currentLocationId)).map((n) => ({ id: n.id, name: n.name, kind: 'npc' as const, hp: n.hp })),
    ...(state.combat?.enemies ?? []).filter((e) => e.hp > 0).map((e) => ({ id: e.id, name: e.name, kind: 'enemy' as const, hp: e.hp })),
  ];
  const used: MapPoint[] = [];
  return occupants.map<MapToken | null>((token) => {
    const stored = map.positions[token.id];
    const free = (p: MapPoint) => walkable(map.tiles[p.y * MAP_WIDTH + p.x].terrain) && !used.some((u) => same(u, p));
    const candidates = map.tiles.filter((p) => free(p) && !occupants.some((other) => other.id !== token.id && map.positions[other.id] && same(map.positions[other.id], p))).sort((a, b) => (Math.abs(a.x - 6) + Math.abs(a.y - 5)) - (Math.abs(b.x - 6) + Math.abs(b.y - 5)));
    const point = stored && free(stored) ? stored : candidates[0];
    if (!point) return null;
    used.push(point);
    return { ...token, x: point.x, y: point.y };
  }).filter((t): t is MapToken => t !== null);
}

/** Enregistre aussi les placements automatiques, pour qu’une arrivée ne déplace pas les autres. */
export function storeSceneMap(state: GameState, map: SceneMap): void {
  if (!state.currentLocationId) return;
  map.positions = Object.fromEntries(mapTokens(state, map).map((token) => [token.id, { x: token.x, y: token.y }]));
  state.maps = { ...state.maps, [state.currentLocationId]: map };
}

export function mapPath(map: SceneMap, from: MapPoint, to: MapPoint, occupied: MapPoint[], maxSteps: number): MapPoint[] | null {
  if (!inMap(to) || !inMap(from) || !walkable(map.tiles[to.y * MAP_WIDTH + to.x].terrain) || occupied.some((p) => same(p, to))) return null;
  const queue: MapPoint[][] = [[from]];
  const seen = new Set([`${from.x},${from.y}`]);
  for (let i = 0; i < queue.length; i++) {
    const path = queue[i], last = path[path.length - 1];
    if (same(last, to)) return path.slice(1);
    if (path.length > maxSteps) continue;
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      const p = { x: last.x + dx, y: last.y + dy }, key = `${p.x},${p.y}`;
      if (inMap(p) && !seen.has(key) && walkable(map.tiles[p.y * MAP_WIDTH + p.x].terrain) && !occupied.some((o) => same(o, p))) {
        seen.add(key); queue.push([...path, p]);
      }
    }
  }
  return null;
}

/** Déplacement libre : une case adjacente, sans IA, jamais en combat ni à travers un obstacle. */
export function moveOnMap(input: GameState, move: MapMoveInput, controlledIds: string[], allowNpc = false): { state: GameState; error?: string } {
  const fail = (error: string) => ({ state: input, error });
  if (!input.currentLocationId || move.locationId !== input.currentLocationId) return fail('Le lieu a changé. Réessayez sur la carte actuelle.');
  if (input.combat) return fail('En combat, déclarez vos déplacements dans votre action au MJ.');
  const map = sceneMap(input), tokens = mapTokens(input, map), token = tokens.find((t) => t.id === move.characterId);
  if (!token || !(controlledIds.includes(token.id) || (allowNpc && token.kind === 'npc'))) return fail('Vous ne contrôlez pas ce pion.');
  if (token.hp !== undefined && token.hp <= 0) return fail('Ce personnage ne peut pas se déplacer.');
  if (token.x !== move.fromX || token.y !== move.fromY) return fail('Le pion a déjà bougé. Réessayez.');
  if (Math.abs(move.x - token.x) + Math.abs(move.y - token.y) !== 1 || !mapPath(map, token, move, tokens.filter((t) => t.id !== token.id), 1)) return fail('Choisissez une case voisine libre, sans obstacle.');
  const state = structuredClone(input);
  storeSceneMap(state, map);
  map.positions[token.id] = { x: move.x, y: move.y };
  state.updatedAt = new Date().toISOString();
  return { state };
}
