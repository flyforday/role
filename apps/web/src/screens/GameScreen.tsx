import { useEffect, useState } from 'react';
import { exportSave } from '@veillee/prompts';
import type { GameController } from '../lib/controller';
import { downloadText } from '../lib/storage';
import { ActionBar } from '../components/ActionBar';
import { CharacterSheet } from '../components/CharacterSheet';
import { CombatPanel } from '../components/CombatPanel';
import { DiceOverlay } from '../components/DiceOverlay';
import { HostTools } from '../components/HostTools';
import { Journal } from '../components/Journal';
import { NarrativeFeed } from '../components/NarrativeFeed';
import { SettingsDialog } from '../components/SettingsDialog';
import { Button } from '../components/ui';
import { slugify } from '@veillee/engine';

export function GameScreen({ game, onHome, extra }: { game: GameController; onHome: () => void; extra?: React.ReactNode }) {
  const { state } = game;
  const [activeId, setActiveId] = useState<string | null>(game.controlledIds[0] ?? null);
  const [tab, setTab] = useState<'fiches' | 'journal'>('fiches');
  const [tools, setTools] = useState(false);
  const [settings, setSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [panel, setPanel] = useState(false);

  useEffect(() => {
    if (!activeId || !game.controlledIds.includes(activeId)) setActiveId(game.controlledIds[0] ?? null);
  }, [game.controlledIds, activeId]);

  const mine = game.controlledIds;
  const ordered = [...state.characters].sort((a, b) => Number(mine.includes(b.id)) - Number(mine.includes(a.id)));

  return (
    <div className="flex h-[100dvh] flex-col">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-nuit-700 bg-nuit-900/90 px-4 py-2">
        <div className="min-w-0">
          <button onClick={onHome} className="text-xs text-parchemin-300 hover:text-white">
            ← Veillée
          </button>
          <h1 className="truncate font-titre text-2xl font-semibold text-parchemin-100">{state.campaign.title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {game.inviteUrl && (
            <Button
              variant="ghost"
              className="text-xs"
              onClick={() => {
                void navigator.clipboard?.writeText(game.inviteUrl!);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? '✓ Lien copié' : '🔗 Inviter'}
            </Button>
          )}
          <Button variant="ghost" className="text-xs" onClick={() => downloadText(`veillee-${slugify(state.campaign.title)}-tour${state.turn}.json`, exportSave(state))}>
            ⤓ Exporter
          </Button>
          {game.isHost && (
            <Button variant="ghost" className="text-xs" onClick={() => setTools(true)}>
              ⚙ Outils de l'hôte
            </Button>
          )}
          <Button variant="ghost" className="text-xs" onClick={() => setSettings(true)}>
            Réglages
          </Button>
          <Button variant="secondary" className="text-xs lg:hidden" aria-expanded={panel} onClick={() => setPanel((p) => !p)}>
            {panel ? 'Fermer la fiche' : 'Fiche & journal'}
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <main className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
            <div className="mx-auto max-w-3xl">
              <NarrativeFeed state={state} live={game.live} />
            </div>
          </div>
          <div className="border-t border-nuit-700 bg-nuit-900/95 px-4 py-3 sm:px-8">
            <div className="mx-auto max-w-3xl space-y-2">
              {game.error && (
                <div className="flex items-start justify-between gap-2 rounded-lg bg-sang-500/10 p-2 text-sm text-sang-400" role="alert">
                  <span>{game.error}</span>
                  <button onClick={game.dismissError} aria-label="Fermer l'erreur">
                    ✕
                  </button>
                </div>
              )}
              {extra}
              <CombatPanel state={state} />
              {game.pending.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 rounded-lg bg-nuit-800 p-2 text-sm text-parchemin-200">
                  <span>Actions déclarées : {game.pending.map((p) => p.characterName).join(', ')}</span>
                  {game.isHost && state.turnMode === 'tour' && (
                    <Button variant="primary" className="ml-auto px-3 py-1" disabled={game.busy} onClick={game.resolvePending}>
                      Résoudre le tour
                    </Button>
                  )}
                </div>
              )}
              {mine.length > 1 && (
                <div className="flex flex-wrap gap-1">
                  {mine.map((id) => {
                    const c = state.characters.find((x) => x.id === id);
                    return (
                      <button key={id} onClick={() => setActiveId(id)} className={`rounded-md px-2 py-0.5 text-xs ${activeId === id ? 'bg-braise-500 text-nuit-950' : 'bg-nuit-700 text-parchemin-200'}`}>
                        {c?.name}
                      </button>
                    );
                  })}
                </div>
              )}
              <ActionBar game={game} characterId={activeId} />
            </div>
          </div>
        </main>

        <aside className={`${panel ? 'block' : 'hidden'} max-h-[55vh] overflow-y-auto border-t border-nuit-700 bg-nuit-900/60 p-4 lg:block lg:max-h-none lg:w-80 lg:border-l lg:border-t-0 xl:w-96`}>
          <div className="mb-3 flex gap-1">
            {(['fiches', 'journal'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-md py-1 text-sm ${tab === t ? 'bg-nuit-700 text-parchemin-100' : 'text-parchemin-300 hover:bg-nuit-800'}`}>
                {t === 'fiches' ? 'Personnages' : 'Journal'}
              </button>
            ))}
          </div>
          {tab === 'fiches' ? (
            <div className="space-y-3">
              {ordered.map((c) => (
                <CharacterSheet key={c.id} character={c} mine={mine.includes(c.id)} />
              ))}
              {state.characters.length === 0 && <p className="text-sm text-parchemin-300">Aucun personnage pour l'instant.</p>}
            </div>
          ) : (
            <Journal state={state} />
          )}
        </aside>
      </div>

      <DiceOverlay dice={game.dice} />
      {game.isHost && <HostTools game={game} open={tools} onClose={() => setTools(false)} />}
      <SettingsDialog open={settings} onClose={() => setSettings(false)} />
    </div>
  );
}
