import { useEffect, useState } from 'react';
import { MAP_HEIGHT, MAP_WIDTH, mapTokens, sceneMap, walkable, type MapTerrain } from '@veillee/engine';
import type { GameController } from '../lib/controller';
import { CharacterPortrait } from './CharacterPortrait';
import { Button } from './ui';

const TERRAIN: Record<MapTerrain, { label: string; color: string; symbol: string }> = {
  sol: { label: 'Sol', color: '#605041', symbol: '' },
  herbe: { label: 'Herbe', color: '#40533a', symbol: '' },
  chemin: { label: 'Chemin', color: '#8c7651', symbol: '' },
  mur: { label: 'Mur', color: '#353940', symbol: '▰' },
  eau: { label: 'Eau', color: '#315b70', symbol: '≈' },
  arbre: { label: 'Arbre', color: '#283c30', symbol: '♠' },
  rocher: { label: 'Rocher', color: '#53555b', symbol: '◆' },
  porte: { label: 'Porte', color: '#94714c', symbol: '▥' },
  table: { label: 'Table', color: '#65462e', symbol: '▦' },
  feu: { label: 'Foyer', color: '#703f2d', symbol: '♨' },
};

export function SceneMap({ game, characterId }: { game: GameController; characterId: string | null }) {
  const { state } = game;
  const [selected, setSelected] = useState(characterId);
  const [zoom, setZoom] = useState(1);
  const map = sceneMap(state), tokens = mapTokens(state, map);
  const token = tokens.find((t) => t.id === selected);
  const location = state.locations.find((l) => l.id === state.currentLocationId);
  const canControl = (id: string) => game.controlledIds.includes(id) || (game.isHost && tokens.some((t) => t.id === id && t.kind === 'npc'));
  const enabled = !!token && canControl(token.id) && !game.busy && !state.combat;
  useEffect(() => { setSelected(characterId); }, [characterId]);
  useEffect(() => { if (!tokens.some((t) => t.id === selected)) setSelected(characterId); }, [state.currentLocationId, selected, characterId, tokens]);
  const move = (x: number, y: number) => {
    if (!enabled || !token || !state.currentLocationId) return;
    void game.moveOnMap({ characterId: token.id, locationId: state.currentLocationId, fromX: token.x, fromY: token.y, x, y });
  };
  if (!location) return <p className="p-4 text-parchemin-300">La carte apparaîtra dès que votre lieu sera connu.</p>;
  return (
    <section className="rounded-2xl border border-nuit-600 bg-nuit-900 p-3 sm:p-4" aria-label="Carte du lieu">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-titre text-2xl text-parchemin-100">{location.name}</h2>
          <p className="text-xs text-parchemin-300">{game.mode === 'online' ? 'Carte partagée en direct' : 'Carte de la scène'} · Vue du dessus</p>
        </div>
        <div className="flex items-center gap-2">
          <Button aria-label="Réduire la carte" disabled={zoom <= 1} onClick={() => setZoom((z) => z - 0.25)}>−</Button>
          <span className="text-xs text-parchemin-200">{zoom * 100} %</span>
          <Button aria-label="Agrandir la carte" disabled={zoom >= 2} onClick={() => setZoom((z) => z + 0.25)}>+</Button>
        </div>
      </header>
      <div className="overflow-auto rounded-xl border border-nuit-600" tabIndex={0} aria-label="Plan et pions. Sélectionnez votre pion puis une case voisine.">
        <div className="relative isolate" style={{ width: `${zoom * 100}%`, minWidth: 420 * zoom, aspectRatio: `${MAP_WIDTH}/${MAP_HEIGHT}` }}>
          <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${MAP_WIDTH}, 1fr)` }}>
            {map.tiles.map((tile) => {
              const terrain = TERRAIN[tile.terrain];
              const adjacent = !!token && Math.abs(tile.x - token.x) + Math.abs(tile.y - token.y) === 1;
              const free = !tokens.some((t) => t.x === tile.x && t.y === tile.y);
              return <button key={`${tile.x},${tile.y}`} aria-label={`Case ${tile.x}, ${tile.y} — ${terrain.label}`} disabled={!enabled || !adjacent || !free || !walkable(tile.terrain)}
                onClick={() => move(tile.x, tile.y)} title={`${terrain.label} (${tile.x}, ${tile.y})`}
                className={`border border-black/10 text-lg text-white/30 ${enabled && adjacent && free && walkable(tile.terrain) ? 'ring-1 ring-inset ring-braise-300/60 hover:brightness-150 focus:brightness-150' : ''}`}
                style={{ backgroundColor: terrain.color }}><span aria-hidden="true">{terrain.symbol}</span></button>;
            })}
          </div>
          {tokens.map((t) => <button key={t.id} onClick={() => setSelected(t.id)} aria-label={`${t.name} — ${t.kind === 'pc' ? 'personnage' : t.kind === 'npc' ? 'PNJ' : 'ennemi'}, case ${t.x}, ${t.y}`} aria-pressed={selected === t.id} title={`${t.name}${game.controlledIds.includes(t.id) ? ' (votre personnage)' : ''}`}
            className={`absolute z-10 flex items-center justify-center overflow-hidden rounded-full border-2 shadow-lg transition-[left,top] duration-200 motion-reduce:transition-none ${selected === t.id ? 'border-braise-300 ring-2 ring-braise-300/50' : t.kind === 'npc' ? 'border-sky-300' : t.kind === 'enemy' ? 'border-sang-400' : 'border-parchemin-100'}`}
            style={{ width: `${85 / MAP_WIDTH}%`, height: `${85 / MAP_HEIGHT}%`, left: `${(t.x + 0.075) * 100 / MAP_WIDTH}%`, top: `${(t.y + 0.075) * 100 / MAP_HEIGHT}%`, background: t.kind === 'enemy' ? '#692c35' : '#25232d' }}>
            <CharacterPortrait name={t.name} portraitId={t.portraitId} className="h-full w-full rounded-full text-sm sm:text-lg" />
          </button>)}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-parchemin-200" aria-live="polite">{token ? `${token.name} · case ${token.x}, ${token.y}${canControl(token.id) ? '' : ' · consultation'}` : 'Sélectionnez votre pion.'}</p>
        <div className="flex gap-1" aria-label="Déplacements">
          {([['←', -1, 0, 'gauche'], ['↑', 0, -1, 'haut'], ['↓', 0, 1, 'bas'], ['→', 1, 0, 'droite']] as const).map(([label, dx, dy, direction]) => <Button key={direction} aria-label={`Déplacer vers ${direction}`} disabled={!enabled} onClick={() => token && move(token.x + dx, token.y + dy)}>{label}</Button>)}
        </div>
      </div>
      <p className="mt-2 text-xs text-parchemin-300">{state.combat ? 'Combat en cours : déclarez vos manœuvres dans votre action au MJ. Les positions sont verrouillées.' : 'Sélectionnez votre pion puis une case voisine éclairée, ou utilisez les flèches. L’hôte peut aussi déplacer les PNJ.'}</p>
      <p className="mt-1 text-xs text-parchemin-300">Plan indicatif, précisé au fil du récit. Aucun passage secret n’est dévoilé.</p>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-parchemin-200">
        {tokens.map((t) => <button key={t.id} onClick={() => setSelected(t.id)} className="hover:text-braise-300"><span className={t.kind === 'npc' ? 'text-sky-300' : t.kind === 'enemy' ? 'text-sang-400' : 'text-parchemin-100'}>●</span> {t.name}{game.controlledIds.includes(t.id) ? ' (vous)' : t.kind === 'npc' ? ' (PNJ)' : ''}</button>)}
      </div>
    </section>
  );
}
