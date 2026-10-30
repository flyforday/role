import { useState } from 'react';
import type { GameState } from '@veillee/engine';
import { WorldProposalSchema, buildWorldMessages, gameFromWorld, parseWith, type WorldPreferences, type WorldProposal } from '@veillee/prompts';
import { Button, Card, Field, Input, Spinner, TextArea } from '../components/ui';
import { createLlm } from '../lib/llm';
import { errorMessage } from '../lib/controller';

const GENRES = ['Fantasy', 'Fantasy sombre', 'Science-fiction', 'Horreur', 'Steampunk', 'Post-apocalyptique', 'Cape et épée', 'Mythologie', 'Contemporain mystérieux'];
const TONES = ['Épique', 'Sombre', 'Léger et drôle', 'Mystère', 'Intrigue politique', 'Survie', 'Merveilleux'];

const split = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

export function NewCampaign({ onCreated, onCancel, online }: { onCreated: (state: GameState) => void; onCancel: () => void; online?: boolean }) {
  const [genre, setGenre] = useState('Fantasy');
  const [tone, setTone] = useState('Mystère');
  const [themes, setThemes] = useState('');
  const [lines, setLines] = useState('');
  const [veils, setVeils] = useState('');
  const [rules, setRules] = useState('');
  const [ideas, setIdeas] = useState('');
  const [world, setWorld] = useState<WorldProposal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prefs: WorldPreferences = { genre, tone, themes, lines: split(lines), veils: split(veils), specialRules: rules.trim() || undefined, ideas: ideas.trim() || undefined };

  const propose = async (previous?: WorldProposal) => {
    setLoading(true);
    setError(null);
    try {
      const llm = createLlm();
      let raw = await llm(buildWorldMessages(prefs, previous), { json: true, purpose: 'world' });
      let parsed = parseWith(WorldProposalSchema, raw);
      if (!parsed.ok) {
        raw = await llm(
          [...buildWorldMessages(prefs, previous), { role: 'assistant', content: raw.slice(0, 3000) }, { role: 'user', content: `JSON invalide (${parsed.error}). Renvoie uniquement l'objet JSON corrigé.` }],
          { json: true, purpose: 'world' },
        );
        parsed = parseWith(WorldProposalSchema, raw);
      }
      if (!parsed.ok) throw new Error(`Le MJ n'a pas réussi à proposer un monde lisible (${parsed.error}). Réessayez.`);
      setWorld(parsed.value);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  if (world) {
    const set = (patch: Partial<WorldProposal>) => setWorld({ ...world, ...patch });
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-4">
        <h1 className="font-titre text-4xl font-bold text-parchemin-100">Le monde proposé par le MJ</h1>
        <p className="text-parchemin-300">Modifiez ce qui vous plaît, demandez une autre proposition, ou validez pour créer votre personnage.</p>
        <Card>
          <div className="space-y-3">
            <Field label="Titre de la campagne">
              <Input value={world.title} onChange={(e) => set({ title: e.target.value })} />
            </Field>
            <Field label="Le monde">
              <TextArea rows={4} value={world.setting} onChange={(e) => set({ setting: e.target.value })} />
            </Field>
            <Field label="L'accroche">
              <TextArea rows={2} value={world.pitch} onChange={(e) => set({ pitch: e.target.value })} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Lieu de départ">
                <Input value={world.starting_location.name} onChange={(e) => set({ starting_location: { ...world.starting_location, name: e.target.value } })} />
              </Field>
              <Field label="Première quête">
                <Input value={world.quest.title} onChange={(e) => set({ quest: { ...world.quest, title: e.target.value } })} />
              </Field>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-parchemin-200">Personnages non joueurs</p>
              <ul className="space-y-1 text-sm text-parchemin-200">
                {world.npcs.map((n) => (
                  <li key={n.name}>
                    <strong className="text-parchemin-100">{n.name}</strong> — {n.description} <span className="text-parchemin-300">({n.attitude})</span>
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-xs text-parchemin-300/70">Leurs secrets restent cachés : seul le MJ les connaît.</p>
            </div>
          </div>
        </Card>
        {error && <p className="text-sang-400">{error}</p>}
        <div className="flex flex-wrap justify-between gap-2">
          <Button variant="ghost" onClick={() => setWorld(null)}>
            ← Préférences
          </Button>
          <div className="flex gap-2">
            <Button disabled={loading} onClick={() => propose(world)}>
              {loading ? <Spinner label="Le MJ imagine…" /> : '↻ Autre proposition'}
            </Button>
            <Button variant="primary" disabled={loading} onClick={() => onCreated(gameFromWorld(world, prefs))}>
              Valider ce monde →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      <h1 className="font-titre text-4xl font-bold text-parchemin-100">{online ? 'Nouvelle partie en ligne' : 'Nouvelle campagne'}</h1>
      <p className="text-parchemin-300">Décrivez l'aventure qui vous fait envie : le MJ vous proposera un monde original.</p>
      <Card>
        <div className="space-y-4">
          <Field label="Genre">
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <Chip key={g} active={genre === g} onClick={() => setGenre(g)}>
                  {g}
                </Chip>
              ))}
            </div>
          </Field>
          <Field label="Ton">
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <Chip key={t} active={tone === t} onClick={() => setTone(t)}>
                  {t}
                </Chip>
              ))}
            </div>
          </Field>
          <Field label="Thèmes souhaités" hint="Ex. : piraterie, cités englouties, rivalités de guildes">
            <Input value={themes} onChange={(e) => setThemes(e.target.value)} />
          </Field>
          <Field label="Idées en vrac (facultatif)">
            <TextArea rows={2} value={ideas} onChange={(e) => setIdeas(e.target.value)} placeholder="Un phare qui guide les morts…" />
          </Field>
        </div>
      </Card>
      <Card title="Sécurité de table">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Lignes : thèmes interdits" hint="Jamais abordés. Séparés par des virgules.">
            <Input value={lines} onChange={(e) => setLines(e.target.value)} placeholder="araignées, violence envers les enfants" />
          </Field>
          <Field label="Voiles : thèmes hors champ" hint="Peuvent exister mais ne sont pas décrits.">
            <Input value={veils} onChange={(e) => setVeils(e.target.value)} placeholder="torture, scènes intimes" />
          </Field>
        </div>
        <p className="mt-3 text-xs text-parchemin-300">Pendant la partie, le bouton « Carte X » demande au MJ de changer immédiatement de direction, sans avoir à se justifier.</p>
      </Card>
      <Card title="Règles spéciales (facultatif)">
        <TextArea rows={2} value={rules} onChange={(e) => setRules(e.target.value)} placeholder="La magie a toujours un prix ; pas de résurrection…" />
      </Card>
      {error && <p className="rounded-lg bg-sang-500/10 p-3 text-sang-400">{error}</p>}
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button variant="primary" disabled={loading} onClick={() => propose()}>
          {loading ? <Spinner label="Le MJ imagine votre monde…" /> : 'Proposer un monde ✦'}
        </Button>
      </div>
    </div>
  );
}

function Chip({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 text-sm transition ${active ? 'border-braise-500 bg-braise-500/15 text-braise-300' : 'border-nuit-600 text-parchemin-200 hover:border-parchemin-300'}`}
    >
      {children}
    </button>
  );
}
