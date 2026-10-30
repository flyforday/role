import { useState, type FormEvent } from 'react';
import type { GameController } from '../lib/controller';
import { isConscious } from '@veillee/engine';
import { Button } from './ui';

export function ActionBar({ game, characterId }: { game: GameController; characterId: string | null }) {
  const [text, setText] = useState('');
  const { state, busy } = game;
  const pc = state.characters.find((c) => c.id === characterId);
  const waiting = game.pending.some((p) => p.characterId === characterId);
  const disabled = busy || !pc || waiting;
  const canAct = pc ? isConscious(pc) : false;

  const send = async (actionText: string) => {
    if (!pc || !actionText.trim()) return;
    setText('');
    await game.submit({ characterId: pc.id, kind: 'action', text: actionText.trim() });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(text);
  };

  const enemies = state.combat?.enemies.filter((e) => e.hp > 0) ?? [];

  return (
    <div className="space-y-2">
      {state.combat && pc && canAct && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-sang-400">Combat</span>
          {enemies.map((e) => (
            <Button
              key={e.id}
              variant="danger"
              className="px-3 py-1"
              disabled={disabled}
              onClick={() => game.submit({ characterId: pc.id, kind: 'attack', text: text.trim(), targetId: e.id }).then(() => setText(''))}
            >
              ⚔️ Attaquer {e.name}
            </Button>
          ))}
        </div>
      )}
      {state.suggestedActions.length > 0 && !busy && (
        <div className="flex flex-wrap gap-2">
          {state.suggestedActions.map((s) => (
            <button
              key={s}
              disabled={disabled}
              onClick={() => send(s)}
              className="rounded-full border border-nuit-600 bg-nuit-800 px-3 py-1 text-sm text-parchemin-200 transition hover:border-braise-500 hover:text-white disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <form onSubmit={onSubmit} className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send(text);
            }
          }}
          rows={2}
          disabled={disabled}
          placeholder={
            !pc
              ? 'Créez votre personnage pour jouer.'
              : waiting
                ? 'Action déclarée, en attente des autres joueurs…'
                : !canAct
                  ? `${pc.name} est hors de combat… décrivez ce que vous tentez malgré tout.`
                  : `Que fait ${pc.name} ? (Entrée pour envoyer)`
          }
          aria-label="Votre action"
          className="min-h-[3rem] flex-1 resize-none rounded-xl border border-nuit-600 bg-nuit-950/80 px-4 py-3 text-parchemin-100 placeholder:text-parchemin-300/50 focus:border-braise-500 focus:outline-none"
        />
        <div className="flex flex-col gap-2">
          <Button type="submit" variant="primary" disabled={disabled || !text.trim()}>
            Agir
          </Button>
          <button
            type="button"
            disabled={!pc || busy}
            onClick={() => pc && game.submit({ characterId: pc.id, kind: 'xcard', text: '' })}
            title="Carte X : demande au MJ de changer immédiatement de direction, sans explication."
            className="rounded-lg border border-sang-500/60 px-2 py-1 text-xs font-bold text-sang-400 hover:bg-sang-500/20 disabled:opacity-40"
          >
            ✕ Carte X
          </button>
        </div>
      </form>
    </div>
  );
}
