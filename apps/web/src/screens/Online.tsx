import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { GameState } from '@veillee/engine';
import { NewCampaign } from './NewCampaign';
import { CharacterCreator } from './CharacterCreator';
import { GameScreen } from './GameScreen';
import { useOnlineGame } from '../hooks/useOnlineGame';
import { createOnlineGame, joinGame } from '../lib/online';
import { sendMagicLink, supabase, useSession } from '../lib/supabase';
import { saveSettings, useSettings } from '../lib/settings';
import { navigate } from '../router';
import { Button, Card, Field, Input, Spinner } from '../components/ui';
import { errorMessage } from '../lib/controller';

function RequireLogin({ children }: { children: (session: Session) => React.ReactNode }) {
  const { session, loading } = useSession();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!supabase) {
    return (
      <Centered>
        <p>Le multijoueur n'est pas configuré sur ce déploiement.</p>
        <Button className="mt-4" onClick={() => navigate('/')}>
          Accueil
        </Button>
      </Centered>
    );
  }
  if (loading) return <Centered><Spinner label="Connexion…" /></Centered>;
  if (session) return <>{children(session)}</>;
  return (
    <Centered>
      <Card title="Connexion">
        <p className="mb-3 text-sm text-parchemin-300">Recevez un lien magique par e-mail pour rejoindre la table.</p>
        {sent ? (
          <p className="text-mousse-400">Lien envoyé ! Ouvrez-le depuis ce navigateur.</p>
        ) : (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              sendMagicLink(email).then(() => setSent(true), (err) => setError(errorMessage(err)));
            }}
          >
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.fr" />
            <Button variant="primary" type="submit">
              Envoyer
            </Button>
          </form>
        )}
        {error && <p className="mt-2 text-sm text-sang-400">{error}</p>}
      </Card>
    </Centered>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-md p-8 text-center text-parchemin-200">{children}</div>;
}

function NameGate({ children }: { children: (name: string) => React.ReactNode }) {
  const s = useSettings();
  const [name, setName] = useState(s.displayName);
  if (s.displayName) return <>{children(s.displayName)}</>;
  return (
    <Centered>
      <Card title="Votre nom de joueur">
        <form
          className="space-y-3 text-left"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) saveSettings({ displayName: name.trim() });
          }}
        >
          <Field label="Affiché aux autres joueurs">
            <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
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
  return (
    <RequireLogin>
      {() => (
        <NameGate>
          {(name) => (
            <>
              <NewCampaign
                online
                onCancel={() => navigate('/')}
                onCreated={async (state: GameState) => {
                  try {
                    const row = await createOnlineGame(state, name);
                    navigate(`/en-ligne/${row.id}`);
                  } catch (e) {
                    setError(errorMessage(e));
                  }
                }}
              />
              {error && <p className="mx-auto max-w-3xl px-4 text-sang-400">{error}</p>}
            </>
          )}
        </NameGate>
      )}
    </RequireLogin>
  );
}

export function JoinRoute({ code }: { code: string }) {
  return (
    <RequireLogin>
      {() => (
        <NameGate>
          {(name) => <Joining code={code} name={name} />}
        </NameGate>
      )}
    </RequireLogin>
  );
}

function Joining({ code, name }: { code: string; name: string }) {
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    joinGame(code, name).then(
      (id) => navigate(`/en-ligne/${id}`),
      (e) => setError(errorMessage(e)),
    );
  }, [code, name]);
  return <Centered>{error ? <p className="text-sang-400">Impossible de rejoindre : {error}</p> : <Spinner label="On vous fait une place près du feu…" />}</Centered>;
}

export function OnlineRoute({ id }: { id: string }) {
  return <RequireLogin>{(session) => <NameGate>{() => <OnlineGameScreen id={id} userId={session.user.id} />}</NameGate>}</RequireLogin>;
}

function OnlineGameScreen({ id, userId }: { id: string; userId: string }) {
  const game = useOnlineGame(id, userId);
  const { displayName } = useSettings();
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
  if (game.loading) return <Centered><Spinner label="Chargement de la partie…" /></Centered>;
  if (!game.hasCharacter && !game.characterRequested) {
    return (
      <CharacterCreator
        campaignTitle={game.state.campaign.title}
        playerName={displayName}
        submitLabel="Rejoindre la table →"
        onCancel={() => navigate('/')}
        onDone={(input) => game.requestCharacter(input)}
      />
    );
  }
  const others = game.members.filter((m) => m.user_id !== userId);
  const waitingHost = !game.hasCharacter && game.characterRequested;
  return (
    <GameScreen
      game={game}
      onHome={() => navigate('/')}
      extra={
        <div className="flex flex-wrap items-center gap-2 text-xs text-parchemin-300">
          <span>{game.isHost ? 'Vous êtes l’hôte : votre navigateur fait tourner le MJ, gardez cet onglet ouvert.' : 'Hôte : ' + (game.members.find((m) => m.role === 'hote')?.display_name ?? '?')}</span>
          {others.length > 0 && <span>· À la table : {others.map((m) => m.display_name).join(', ')}</span>}
          {waitingHost && <span className="text-braise-300">· Votre personnage attend l'arrivée de l'hôte…</span>}
          <span>· Mode {game.state.turnMode === 'tour' ? 'par tour' : 'libre'}</span>
        </div>
      }
    />
  );
}
