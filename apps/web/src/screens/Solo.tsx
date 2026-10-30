import { useState } from 'react';
import { addCharacter, type GameState } from '@veillee/engine';
import { NewCampaign } from './NewCampaign';
import { CharacterCreator } from './CharacterCreator';
import { GameScreen } from './GameScreen';
import { useSoloGame } from '../hooks/useSoloGame';
import { loadGame, saveGame } from '../lib/storage';
import { navigate } from '../router';
import { Button } from '../components/ui';

export function SoloNew() {
  const [world, setWorld] = useState<GameState | null>(null);
  if (!world) return <NewCampaign onCreated={setWorld} onCancel={() => navigate('/')} />;
  return (
    <CharacterCreator
      campaignTitle={world.campaign.title}
      onCancel={() => setWorld(null)}
      onDone={(_input, character) => {
        const state = addCharacter(world, character);
        saveGame(state);
        navigate(`/partie/${state.id}`);
      }}
    />
  );
}

export function SoloGameRoute({ id }: { id: string }) {
  const [state, setState] = useState<GameState | null>(() => loadGame(id));
  if (!state) {
    return (
      <div className="mx-auto max-w-md p-8 text-center text-parchemin-200">
        <p>Cette partie est introuvable dans ce navigateur.</p>
        <Button className="mt-4" onClick={() => navigate('/')}>
          Retour à l'accueil
        </Button>
      </div>
    );
  }
  if (!state.characters.some((c) => !c.companion)) {
    return (
      <CharacterCreator
        campaignTitle={state.campaign.title}
        onCancel={() => navigate('/')}
        onDone={(_i, character) => {
          const next = addCharacter(state, character);
          saveGame(next);
          setState(next);
        }}
      />
    );
  }
  return <SoloGame key={state.id} initial={state} />;
}

function SoloGame({ initial }: { initial: GameState }) {
  const game = useSoloGame(initial);
  return <GameScreen game={game} onHome={() => navigate('/')} />;
}
