import { useEffect, useRef } from 'react';
import type { LogEntry, GameState } from '@veillee/engine';
import type { LiveTurn } from '../lib/controller';
import { Spinner } from './ui';

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n+/).map((p, i) => (
        <p key={i} className="mb-3 last:mb-0">
          {p}
        </p>
      ))}
    </>
  );
}

function Entry({ e }: { e: Pick<LogEntry, 'kind' | 'text' | 'actorName'> }) {
  switch (e.kind) {
    case 'gm':
      return (
        <div className="animate-fadein font-recit text-[17px] leading-relaxed text-parchemin-100">
          <Paragraphs text={e.text} />
        </div>
      );
    case 'player':
      return (
        <div className="animate-fadein ml-auto max-w-[85%] rounded-xl rounded-br-sm border border-braise-500/30 bg-braise-500/10 px-4 py-2 text-parchemin-100">
          <p className="text-xs font-semibold text-braise-300">{e.actorName}</p>
          <p>{e.text}</p>
        </div>
      );
    case 'roll':
      return <p className="animate-fadein text-center text-sm text-braise-300">🎲 {e.text}</p>;
    case 'combat':
      return <p className="animate-fadein border-l-2 border-sang-500/60 pl-3 text-sm text-parchemin-200">⚔️ {e.text}</p>;
    default:
      return <p className="animate-fadein text-center text-xs italic text-parchemin-300">{e.text}</p>;
  }
}

export function NarrativeFeed({ state, live }: { state: GameState; live: LiveTurn | null }) {
  const end = useRef<HTMLDivElement>(null);
  const liveLen = live ? live.items.length + (live.streaming?.length ?? 0) : 0;
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [state.log.length, liveLen]);

  return (
    <div className="space-y-5" aria-live="polite">
      {state.log.map((e) => (
        <Entry key={e.id} e={e} />
      ))}
      {live?.items.map((item, i) => {
        if (item.kind === 'player') return <Entry key={`l${i}`} e={{ kind: 'player', actorName: item.name, text: item.text }} />;
        if (item.kind === 'gm') return <Entry key={`l${i}`} e={{ kind: 'gm', text: item.text }} />;
        if (item.kind === 'roll')
          return (
            <Entry
              key={`l${i}`}
              e={{ kind: 'roll', text: `${item.characterName} : ${item.roll.natural} + ${item.roll.modifier} = ${item.roll.total} contre ${item.roll.difficulty} → ${item.roll.success ? 'réussite' : 'échec'}` }}
            />
          );
        return <Entry key={`l${i}`} e={{ kind: item.kind, text: item.text }} />;
      })}
      {live && live.streaming !== null && (
        <div className="font-recit text-[17px] leading-relaxed text-parchemin-100">
          {live.streaming ? <Paragraphs text={live.streaming} /> : <Spinner label={live.retrying ? 'Le MJ reformule…' : 'Le MJ réfléchit…'} />}
          {live.streaming && <span className="ml-0.5 inline-block h-4 w-2 animate-flicker bg-braise-400 align-middle" />}
        </div>
      )}
      {live && live.streaming === null && <Spinner label="…" />}
      <div ref={end} />
    </div>
  );
}
