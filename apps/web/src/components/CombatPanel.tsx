import type { GameState } from '@veillee/engine';
import { nameOf } from '@veillee/engine';
import { Bar } from './ui';

export function CombatPanel({ state }: { state: GameState }) {
  const combat = state.combat;
  if (!combat) return null;
  return (
    <div className="rounded-xl border border-sang-500/40 bg-sang-500/5 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-titre text-lg font-semibold text-sang-400">⚔️ Combat — round {combat.round}</h3>
        <p className="text-xs text-parchemin-300">Ordre : {combat.order.map((o) => nameOf(state, o.id)).join(' → ')}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {combat.enemies.map((e) => (
          <div key={e.id} className={`rounded-lg bg-nuit-950/60 p-2 ${e.hp <= 0 ? 'opacity-40' : ''}`}>
            <div className="flex justify-between text-sm">
              <span className="text-parchemin-100">{e.name}</span>
              <span className="text-parchemin-300">
                {e.hp}/{e.maxHp} PV · 🛡 {e.defense}
              </span>
            </div>
            <Bar value={e.hp} max={e.maxHp} tone="bad" />
          </div>
        ))}
      </div>
    </div>
  );
}
