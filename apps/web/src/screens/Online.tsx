import { useEffect, useState } from 'react';
import type { GameState } from '@veillee/engine';
import { NewCampaign } from './NewCampaign';
import { CharacterCreator } from './CharacterCreator';
import { GameScreen } from './GameScreen';
import { useOnlineGame } from '../hooks/useOnlineGame';
import { createRoom, isValidCode, normalizeCode, roomInfo } from '../lib/salle';
import { saveSettings, useSettings } from '../lib/settings';
import { navigate } from '../router';
import { Button, Card, Field, Input, Spinner } from '../components/ui';
import { errorMessage } from '../lib/controller';

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-md p-8 text-center text-parchemin-200">{children}</div>;
}

/** Demande un nom de joueur la première fois (pas de compte : le nom suffit). */
function NameGate({ children, intro }: { children: (name: string) => React.ReactNode; intro?: React.ReactNode }) {
  const s = useSettings();
  const [name, setName] = useState(s.displayName);
  if (s.displayName) return <>{children(s.displayName)}</>;
  return (
    <Centered>
      <Card title="Votre nom de joueur">
        {intro}
        <form
          className="space-y-3 text-left"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) saveSettings({ displayName: name.trim().slice(0, 40) });
          }}
        >
          <Field label="Affiché aux autres joueurs">
            <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus maxLength={40} />
          </Field>
          <Button variant="primary" type="submit" disabled={!name.trim()}>
            Continuer
          </Button>
        </form>
      </Card>
    </Centered>
  );
}

export function OnlineNew() {
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  return (
    <NameGate>
      {(name) =>
        creating ? (
          <Centered>
            <Spinner label="On prépare la table…" />
          </Centered>
        ) : (
          <>
            <NewCampaign
              online
              onCancel={() => navigate('/')}
              onCreated={async (state: GameState) => {
                setCreating(true);
                setError(null);
                try {
                  // à plusieurs, le MJ attend par défaut que chacun ait déclaré son action
                  const code = await createRoom({ ...state, turnMode: 'tour' }, name);
                  navigate(`/en-ligne/${code}`);
                } catch (e) {
                  setError(errorMessage(e));
                  setCreating(false);
                }
              }}
            />
            {error && <p className="mx-auto max-w-3xl px-4 pb-8 text-sang-400">{error}</p>}
          </>
        )
      }
    </NameGate>
  );
}

/** Lien d'invitation (#/rejoindre/CODE) : vérifie le code puis ouvre la partie. */
export function JoinRoute({ code: raw }: { code: string }) {
  const code = normalizeCode(raw ?? '');
  const [info, setInfo] = useState<{ title: string; players: string[]; full: boolean } | null>(null);
  const [error, setError] = useState<string | null>(isValidCode(code) ? null : 'Code de partie invalide.');
  useEffect(() => {
    if (!isValidCode(code)) return;
    roomInfo(code).then(setInfo, (e) => setError(errorMessage(e)));
  }, [code]);
  if (error) {
    return (
      <Centered>
        <p className="text-sang-400">{error}</p>
        <Button className="mt-4" onClick={() => navigate('/')}>
          Accueil
        </Button>
      </Centered>
    );
  }
  if (!info) return <Centered><Spinner label="On cherche la table…" /></Centered>;
  const intro = (
    <p className="mb-3 text-sm text-parchemin-300">
      Vous rejoignez <strong className="text-parchemin-100">{info.title}</strong>
      {info.players.length > 0 && <> avec {info.players.join(', ')}</>}.
    </p>
  );
  return <NameGate intro={intro}>{() => <Redirect to={`/en-ligne/${code}`} />}</NameGate>;
}

function Redirect({ to }: { to: string }) {
  useEffect(() => navigate(to), [to]);
  return null;
}

export function OnlineRoute({ id }: { id: string }) {
  const code = normalizeCode(id ?? '');
  if (!isValidCode(code)) return <JoinRoute code={code} />;
  return <NameGate>{(name) => <OnlineGameScreen code={code} name={name} />}</NameGate>;
}

const STATUS_LABEL = { connexion: 'Connexion…', connecte: 'Connecté', reconnexion: 'Reconnexion…', ferme: 'Déconnecté' } as const;

function OnlineGameScreen({ code, name }: { code: string; name: string }) {
  const game = useOnlineGame(code, name);
  const [copied, setCopied] = useState(false);
  if (game.loadError) {
    return (
      <Centered>
        <p className="text-sang-400">{game.loadError}</p>
        <Button className="mt-4" onClick={() => navigate('/')}>
          Accueil
        </Button>
      </Centered>
    );
  }
  if (game.loading) return <Centered><Spinner label={game.status === 'reconnexion' ? 'Le relais ne répond pas, nouvel essai…' : 'On vous fait une place près du feu…'} /></Centered>;
  if (!game.hasCharacter && !game.characterRequested) {
    return (
      <CharacterCreator
        campaignTitle={game.state.campaign.title}
        playerName={name}
        submitLabel="Rejoindre la table →"
        onCancel={() => navigate('/')}
        onDone={(input) => game.requestCharacter(input)}
      />
    );
  }
  const host = game.members.find((m) => m.role === 'hote');
  const others = game.members.filter((m) => m.playerId !== game.userId);
  const waitingHost = !game.hasCharacter && game.characterRequested;
  return (
    <GameScreen
      game={game}
      onHome={() => navigate('/')}
      extra={
        <div className="space-y-1 text-xs text-parchemin-300">
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="rounded-md border border-braise-500/60 px-2 py-0.5 font-mono text-sm tracking-[0.2em] text-braise-300 hover:bg-braise-500/10"
              title="Copier le code de la partie"
              onClick={() => {
                void navigator.clipboard?.writeText(code);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? '✓ copié' : code}
            </button>
            <span className={game.status === 'connecte' ? 'text-mousse-400' : 'text-braise-300'}>● {STATUS_LABEL[game.status]}</span>
            <span>
              · {game.isHost ? 'Vous êtes l’hôte : le MJ tourne dans votre navigateur, gardez cet onglet ouvert.' : `Hôte : ${host?.name ?? '?'}`}
            </span>
            {others.length > 0 && (
              <span>
                · À la table :{' '}
                {others.map((m, i) => (
                  <span key={m.playerId} className={m.online ? 'text-parchemin-100' : 'opacity-50'} title={m.online ? 'en ligne' : 'absent'}>
                    {i > 0 && ', '}
                    {m.name}
                  </span>
                ))}
              </span>
            )}
            <span>· Mode {game.state.turnMode === 'tour' ? 'par tour (le MJ attend tout le monde)' : 'libre'}</span>
          </div>
          {waitingHost && <p className="text-braise-300">Votre personnage attend que l’hôte l’ajoute à la table…</p>}
          {!game.isHost && !game.hostOnline && game.status === 'connecte' && (
            <p className="flex flex-wrap items-center gap-2 text-braise-300">
              L’hôte s’est absenté : la partie est en pause.
              <Button className="px-2 py-0.5 text-xs" onClick={game.takeOver}>
                Prendre la main (le MJ tournera chez moi)
              </Button>
            </p>
          )}
        </div>
      }
    />
  );
}
