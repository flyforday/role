import { currentLocation, currentScene, npcsHere, type GameState } from '@veillee/engine';
import { Tag } from './ui';

export function Journal({ state }: { state: GameState }) {
  const loc = currentLocation(state);
  const scene = currentScene(state);
  const here = npcsHere(state);
  const active = state.quests.filter((q) => q.status === 'active');
  const done = state.quests.filter((q) => q.status !== 'active');
  return (
    <div className="space-y-4 text-sm">
      <section>
        <h3 className="mb-1 font-titre text-lg font-semibold text-parchemin-100">📍 {loc?.name ?? 'Lieu inconnu'}</h3>
        {loc?.description && <p className="text-parchemin-300">{loc.description}</p>}
        {scene && state.scenario && (
          <p className="mt-1 text-xs text-parchemin-300/70">
            📖 {state.scenario.scenario.title} — {scene.title} · {state.scenario.scenario.credits.author}
          </p>
        )}
      </section>
      <section>
        <h3 className="mb-1 font-titre text-lg font-semibold text-parchemin-100">Journal de quête</h3>
        {active.length === 0 && <p className="text-parchemin-300/60">Aucune quête en cours.</p>}
        <ul className="space-y-2">
          {active.map((q) => (
            <li key={q.id} className="rounded-lg bg-nuit-950/50 p-2">
              <p className="font-medium text-parchemin-100">{q.title}</p>
              {q.objective && <p className="text-parchemin-300">{q.objective}</p>}
              {q.clues.length > 0 && (
                <ul className="mt-1 list-inside list-disc text-xs text-parchemin-200">
                  {q.clues.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
        {done.length > 0 && (
          <ul className="mt-2 space-y-1">
            {done.map((q) => (
              <li key={q.id} className="flex items-center justify-between text-parchemin-300">
                <span className="line-through decoration-parchemin-300/40">{q.title}</span>
                <Tag tone={q.status === 'réussie' ? 'good' : 'bad'}>{q.status}</Tag>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h3 className="mb-1 font-titre text-lg font-semibold text-parchemin-100">Personnages rencontrés</h3>
        <ul className="space-y-1">
          {state.npcs.map((n) => (
            <li key={n.id} className={`flex items-start justify-between gap-2 ${n.status === 'mort' ? 'opacity-50' : ''}`}>
              <span>
                <span className="text-parchemin-100">{n.name}</span>
                {n.description && <span className="text-parchemin-300"> — {n.description}</span>}
              </span>
              <span className="shrink-0">
                {n.status === 'mort' ? <Tag tone="bad">mort</Tag> : here.includes(n) ? <Tag tone="ember">{n.attitude ?? 'ici'}</Tag> : null}
              </span>
            </li>
          ))}
          {state.npcs.length === 0 && <li className="text-parchemin-300/60">Personne pour l'instant.</li>}
        </ul>
      </section>
    </div>
  );
}
