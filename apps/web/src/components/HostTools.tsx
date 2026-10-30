import { useState } from 'react';
import { makeId, type GameState, type LoreEntry } from '@veillee/engine';
import { exportSave, importSave } from '@veillee/prompts';
import type { GameController } from '../lib/controller';
import { Button, Field, Input, Modal, TextArea } from './ui';

type Tab = 'tours' | 'lore' | 'resume' | 'etat';

export function HostTools({ game, open, onClose }: { game: GameController; open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('tours');
  const tabs: Array<[Tab, string]> = [
    ['tours', 'Tours'],
    ['lore', 'Lorebook'],
    ['resume', 'Résumé & notes'],
    ['etat', 'État (avancé)'],
  ];
  return (
    <Modal open={open} onClose={onClose} title="Outils de l'hôte" wide>
      <nav className="mb-4 flex flex-wrap gap-1 border-b border-nuit-700 pb-2">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-md px-3 py-1 text-sm ${tab === id ? 'bg-braise-500 text-nuit-950' : 'text-parchemin-200 hover:bg-nuit-700'}`}
          >
            {label}
          </button>
        ))}
      </nav>
      {tab === 'tours' && <TurnsTab game={game} onClose={onClose} />}
      {tab === 'lore' && <LoreTab game={game} />}
      {tab === 'resume' && <SummaryTab game={game} />}
      {tab === 'etat' && <StateTab game={game} />}
    </Modal>
  );
}

function TurnsTab({ game, onClose }: { game: GameController; onClose: () => void }) {
  return (
    <div className="space-y-4 text-sm text-parchemin-200">
      <div className="flex flex-wrap gap-2">
        <Button disabled={!game.canUndo} onClick={() => game.undo().then(onClose)}>
          ↶ Annuler le dernier tour
        </Button>
        <Button disabled={!game.canUndo} onClick={() => (onClose(), game.regenerate())}>
          ↻ Relancer la dernière réponse du MJ
        </Button>
      </div>
      <p className="text-parchemin-300">Relancer annule le dernier tour puis renvoie les mêmes actions au MJ (les dés sont relancés par le code).</p>
      {game.mode === 'online' && (
        <Field label="Gestion des tours" hint="Libre : chaque action est résolue dès qu'elle arrive. Par tour : chacun déclare son action, puis le MJ résout tout d'un coup.">
          <div className="flex gap-2">
            {(['libre', 'tour'] as const).map((m) => (
              <Button key={m} variant={game.state.turnMode === m ? 'primary' : 'secondary'} onClick={() => game.setTurnMode(m)}>
                {m === 'libre' ? 'Mode libre' : 'Mode par tour'}
              </Button>
            ))}
          </div>
        </Field>
      )}
    </div>
  );
}

function LoreTab({ game }: { game: GameController }) {
  const lore = game.state.lore;
  const [editing, setEditing] = useState<LoreEntry | null>(null);
  const save = async (entry: LoreEntry) => {
    const exists = lore.some((l) => l.id === entry.id);
    const next = exists ? lore.map((l) => (l.id === entry.id ? entry : l)) : [...lore, entry];
    await game.replaceState({ ...game.state, lore: next });
    setEditing(null);
  };
  const remove = (id: string) => game.replaceState({ ...game.state, lore: lore.filter((l) => l.id !== id) });
  return (
    <div className="space-y-3 text-sm">
      <p className="text-parchemin-300">Les entrées sont envoyées au MJ quand un de leurs mots-clés apparaît dans les derniers échanges.</p>
      <ul className="max-h-80 space-y-2 overflow-y-auto">
        {lore.map((l) => (
          <li key={l.id} className="rounded-lg bg-nuit-950/60 p-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-braise-300">{l.keywords.join(', ')}</p>
              <div className="flex gap-1">
                <Button variant="ghost" className="px-2 py-0.5 text-xs" onClick={() => setEditing(l)}>
                  Modifier
                </Button>
                <Button variant="ghost" className="px-2 py-0.5 text-xs" onClick={() => remove(l.id)}>
                  Supprimer
                </Button>
              </div>
            </div>
            <p className="text-parchemin-200">{l.text}</p>
          </li>
        ))}
      </ul>
      {editing ? (
        <LoreForm entry={editing} onSave={save} onCancel={() => setEditing(null)} />
      ) : (
        <Button onClick={() => setEditing({ id: makeId('lore'), keywords: [], text: '' })}>+ Nouvelle entrée</Button>
      )}
    </div>
  );
}

function LoreForm({ entry, onSave, onCancel }: { entry: LoreEntry; onSave: (e: LoreEntry) => void; onCancel: () => void }) {
  const [keywords, setKeywords] = useState(entry.keywords.join(', '));
  const [text, setText] = useState(entry.text);
  const kws = keywords.split(',').map((k) => k.trim()).filter(Boolean);
  return (
    <div className="space-y-2 rounded-lg border border-nuit-600 p-3">
      <Field label="Mots-clés (séparés par des virgules)">
        <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="phare, gardien" />
      </Field>
      <Field label="Texte">
        <TextArea rows={3} value={text} onChange={(e) => setText(e.target.value)} />
      </Field>
      <div className="flex gap-2">
        <Button variant="primary" disabled={!kws.length || !text.trim()} onClick={() => onSave({ ...entry, keywords: kws, text: text.trim() })}>
          Enregistrer
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </div>
  );
}

function SummaryTab({ game }: { game: GameController }) {
  const [summary, setSummary] = useState(game.state.summary);
  const [notes, setNotes] = useState(game.state.memoryNotes.join('\n'));
  return (
    <div className="space-y-3 text-sm">
      <Field label="Résumé glissant" hint={`Mis à jour automatiquement ; intègre les tours jusqu'au n°${game.state.summarizedThroughTurn}.`}>
        <TextArea rows={8} value={summary} onChange={(e) => setSummary(e.target.value)} />
      </Field>
      <Field label="Notes du MJ (une par ligne)">
        <TextArea rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      <Button
        variant="primary"
        onClick={() =>
          game.replaceState({
            ...game.state,
            summary: summary.trim(),
            memoryNotes: notes.split('\n').map((n) => n.trim()).filter(Boolean),
          })
        }
      >
        Enregistrer
      </Button>
    </div>
  );
}

function StateTab({ game }: { game: GameController }) {
  const [text, setText] = useState(() => JSON.stringify(game.state, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const apply = async () => {
    try {
      const parsed: GameState = importSave(text);
      if (parsed.id !== game.state.id) throw new Error("L'identifiant de partie ne peut pas changer.");
      await game.replaceState(parsed);
      setError(null);
      setOk(true);
    } catch (e) {
      setOk(false);
      setError((e as Error).message);
    }
  };
  return (
    <div className="space-y-2 text-sm">
      <p className="text-parchemin-300">Corrigez directement l'état du jeu (PV, inventaire, PNJ…). L'ancien état reste disponible via « Annuler ».</p>
      <TextArea rows={18} spellCheck={false} className="font-mono text-xs" value={text} onChange={(e) => (setText(e.target.value), setOk(false))} />
      {error && <p className="text-sang-400">{error}</p>}
      {ok && <p className="text-mousse-400">État mis à jour.</p>}
      <div className="flex gap-2">
        <Button variant="primary" onClick={apply}>
          Appliquer
        </Button>
        <Button variant="ghost" onClick={() => setText(exportSave(game.state).length ? JSON.stringify(game.state, null, 2) : '')}>
          Recharger
        </Button>
      </div>
    </div>
  );
}
