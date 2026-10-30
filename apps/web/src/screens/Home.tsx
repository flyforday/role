import { useEffect, useRef, useState } from 'react';
import { importSave } from '@veillee/prompts';
import { Button, Card, Input, Spinner } from '../components/ui';
import { SettingsDialog } from '../components/SettingsDialog';
import { deleteGame, listSaves, saveGame, type SaveSummary } from '../lib/storage';
import { supabase, sendMagicLink, signOut, useSession } from '../lib/supabase';
import { listMyGames } from '../lib/online';
import { useSettings } from '../lib/settings';
import { navigate } from '../router';

export function Home() {
  const [saves, setSaves] = useState<SaveSummary[]>(listSaves);
  const [settings, setSettings] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const prefs = useSettings();

  const onImport = async (file: File) => {
    try {
      const state = importSave(await file.text());
      saveGame(state);
      setSaves(listSaves());
      navigate(`/partie/${state.id}`);
    } catch (e) {
      setImportError((e as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 pb-16">
      <header className="relative overflow-hidden rounded-3xl border border-nuit-700 bg-gradient-to-br from-nuit-800 via-nuit-900 to-nuit-950 p-8 sm:p-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-braise-500/20 blur-3xl" />
        <p className="text-sm uppercase tracking-[0.3em] text-braise-300">Jeu de rôle · Maître du Jeu IA</p>
        <h1 className="mt-2 font-titre text-6xl font-bold text-parchemin-100">Veillée</h1>
        <p className="mt-3 max-w-xl font-recit text-lg text-parchemin-200">
          Asseyez-vous près du feu. Décrivez ce que tente votre personnage : le Maître du Jeu raconte, les dés tranchent, et le monde se souvient.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="primary" className="px-6 py-3 text-base" onClick={() => navigate('/nouvelle')}>
            Nouvelle aventure solo
          </Button>
          <Button onClick={() => fileRef.current?.click()}>Importer une sauvegarde</Button>
          <Button variant="ghost" onClick={() => setSettings(true)}>
            Réglages {prefs.provider === 'demo' ? '(démo)' : ''}
          </Button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} />
        </div>
        {importError && <p className="mt-3 text-sm text-sang-400">{importError}</p>}
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Vos parties solo">
          {saves.length === 0 ? (
            <p className="text-parchemin-300">Aucune partie enregistrée dans ce navigateur.</p>
          ) : (
            <ul className="divide-y divide-nuit-700">
              {saves.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 py-2">
                  <button className="min-w-0 text-left" onClick={() => navigate(`/partie/${s.id}`)}>
                    <p className="truncate font-medium text-parchemin-100 hover:text-braise-300">{s.title}</p>
                    <p className="truncate text-xs text-parchemin-300">
                      {s.characters.join(', ') || 'sans personnage'} · tour {s.turn} · {new Date(s.updatedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </button>
                  <Button
                    variant="ghost"
                    className="px-2 py-1 text-xs"
                    onClick={() => {
                      if (confirm(`Supprimer définitivement « ${s.title} » ?`)) {
                        deleteGame(s.id);
                        setSaves(listSaves());
                      }
                    }}
                  >
                    Supprimer
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <OnlinePanel />
      </div>

      <section className="grid gap-4 text-sm text-parchemin-300 sm:grid-cols-3">
        <div>
          <h3 className="font-titre text-lg text-parchemin-100">Le code arbitre</h3>
          <p>Dés, points de vie, inventaire et or sont gérés par le moteur. Le MJ propose, le code valide.</p>
        </div>
        <div>
          <h3 className="font-titre text-lg text-parchemin-100">Le monde se souvient</h3>
          <p>Résumé glissant, lorebook et faits établis gardent l'histoire cohérente au fil des sessions.</p>
        </div>
        <div>
          <h3 className="font-titre text-lg text-parchemin-100">Une table sûre</h3>
          <p>Lignes, voiles et carte X : chacun garde le contrôle de ce qu'il veut vivre.</p>
        </div>
      </section>
      <SettingsDialog open={settings} onClose={() => setSettings(false)} />
    </div>
  );
}

function OnlinePanel() {
  const { session, loading } = useSession();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [games, setGames] = useState<Array<{ id: string; title: string; updated_at: string; host_id: string }> | null>(null);

  useEffect(() => {
    if (!session) return;
    listMyGames().then(setGames).catch((e) => setError((e as Error).message));
  }, [session]);

  if (!supabase) {
    return (
      <Card title="Jouer entre amis">
        <p className="text-parchemin-300">
          Le multijoueur n'est pas encore configuré sur ce déploiement. Renseignez <code className="text-braise-300">VITE_SUPABASE_URL</code> et{' '}
          <code className="text-braise-300">VITE_SUPABASE_ANON_KEY</code> (voir le README) pour créer des parties partagées par lien d'invitation.
        </p>
      </Card>
    );
  }
  if (loading) return <Card title="Jouer entre amis"><Spinner label="Connexion…" /></Card>;
  if (!session) {
    return (
      <Card title="Jouer entre amis">
        <p className="mb-3 text-parchemin-300">Connectez-vous avec un lien magique envoyé par e-mail pour créer ou rejoindre une partie en ligne.</p>
        {sent ? (
          <p className="text-mousse-400">Lien envoyé à {email}. Ouvrez-le depuis ce navigateur.</p>
        ) : (
          <form
            className="flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await sendMagicLink(email);
                setSent(true);
              } catch (err) {
                setError((err as Error).message);
              }
            }}
          >
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.fr" />
            <Button variant="primary" type="submit">
              Recevoir le lien
            </Button>
          </form>
        )}
        {error && <p className="mt-2 text-sm text-sang-400">{error}</p>}
      </Card>
    );
  }
  return (
    <Card
      title="Jouer entre amis"
      actions={
        <Button variant="ghost" className="px-2 py-1 text-xs" onClick={signOut}>
          Se déconnecter
        </Button>
      }
    >
      <p className="mb-3 text-xs text-parchemin-300">Connecté : {session.user.email}</p>
      <Button variant="primary" onClick={() => navigate('/nouvelle-en-ligne')}>
        Créer une partie en ligne
      </Button>
      <ul className="mt-3 divide-y divide-nuit-700">
        {games?.map((g) => (
          <li key={g.id} className="py-2">
            <button className="text-left" onClick={() => navigate(`/en-ligne/${g.id}`)}>
              <p className="font-medium text-parchemin-100 hover:text-braise-300">{g.title}</p>
              <p className="text-xs text-parchemin-300">
                {g.host_id === session.user.id ? 'Vous êtes l’hôte' : 'Invité'} · {new Date(g.updated_at).toLocaleDateString('fr-FR')}
              </p>
            </button>
          </li>
        ))}
        {games?.length === 0 && <li className="py-2 text-sm text-parchemin-300">Aucune partie en ligne. Créez-en une ou ouvrez un lien d'invitation.</li>}
      </ul>
      {error && <p className="mt-2 text-sm text-sang-400">{error}</p>}
    </Card>
  );
}
