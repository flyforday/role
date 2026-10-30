import { ABILITIES, ABILITY_LABELS, xpForLevel, type Character } from '@veillee/engine';
import { Bar, Tag } from './ui';

export function CharacterSheet({ character, mine }: { character: Character; mine?: boolean }) {
  const c = character;
  const nextXp = xpForLevel(c.level + 1);
  return (
    <article className={`rounded-xl border p-3 ${mine ? 'border-braise-500/50 bg-nuit-800/80' : 'border-nuit-700 bg-nuit-900/60'}`}>
      <header className="flex items-baseline justify-between gap-2">
        <div>
          <h3 className="font-titre text-xl font-semibold text-parchemin-100">{c.name}</h3>
          <p className="text-xs text-parchemin-300">
            {c.concept} · niveau {c.level}
            {c.playerName ? ` · ${c.playerName}` : ''}
          </p>
        </div>
        <span className="text-xs text-parchemin-300" title="Défense">
          🛡 {c.defense}
        </span>
      </header>
      <div className="mt-2 space-y-1">
        <div className="flex justify-between text-xs text-parchemin-200">
          <span>Points de vie</span>
          <span>
            {c.hp} / {c.maxHp}
          </span>
        </div>
        <Bar value={c.hp} max={c.maxHp} />
        <div className="flex justify-between text-xs text-parchemin-300">
          <span>
            XP {c.xp} / {nextXp}
          </span>
          <span>🪙 {c.gold} or</span>
        </div>
      </div>
      {c.conditions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {c.conditions.map((cond) => (
            <Tag key={cond} tone="bad">
              {cond}
            </Tag>
          ))}
        </div>
      )}
      <dl className="mt-3 grid grid-cols-3 gap-1 text-center">
        {ABILITIES.map((a) => (
          <div key={a} className="rounded-md bg-nuit-950/60 py-1">
            <dt className="text-[10px] uppercase tracking-wide text-parchemin-300">{ABILITY_LABELS[a].slice(0, 5)}</dt>
            <dd className="font-titre text-lg font-semibold text-parchemin-100">{c.abilities[a] >= 0 ? `+${c.abilities[a]}` : c.abilities[a]}</dd>
          </div>
        ))}
      </dl>
      <details className="mt-3" open={mine}>
        <summary className="cursor-pointer text-sm font-medium text-parchemin-200">Inventaire ({c.inventory.length})</summary>
        <ul className="mt-1 space-y-1 text-sm">
          {c.inventory.map((i) => (
            <li key={i.id} className="flex justify-between gap-2 text-parchemin-200" title={i.description}>
              <span>
                {i.name}
                {i.quantity && i.quantity > 1 ? ` ×${i.quantity}` : ''}
                {c.weapon === i.name && <span className="ml-1 text-xs text-braise-300">(arme)</span>}
              </span>
              {i.damage && <span className="text-xs text-parchemin-300">{i.damage}</span>}
            </li>
          ))}
          {c.inventory.length === 0 && <li className="text-parchemin-300/60">Vide</li>}
        </ul>
      </details>
    </article>
  );
}
