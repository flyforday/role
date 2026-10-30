import { useEffect, useState } from 'react';
import { ABILITY_LABELS, type RollResult } from '@veillee/engine';

/** Animation d'un d20 lancé par le code : visible par tous les joueurs. */
export function DiceOverlay({ dice }: { dice: { roll: RollResult; characterName: string; key: number } | null }) {
  const [visible, setVisible] = useState(false);
  const [face, setFace] = useState(20);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!dice) return;
    setVisible(true);
    setSettled(false);
    const spin = setInterval(() => setFace(1 + Math.floor(Math.random() * 20)), 70);
    const stop = setTimeout(() => {
      clearInterval(spin);
      setFace(dice.roll.natural);
      setSettled(true);
    }, 1100);
    const hide = setTimeout(() => setVisible(false), 3600);
    return () => {
      clearInterval(spin);
      clearTimeout(stop);
      clearTimeout(hide);
    };
  }, [dice]);

  if (!visible || !dice) return null;
  const r = dice.roll;
  const verdict = r.critical === 'réussite' ? 'Réussite critique !' : r.critical === 'échec' ? 'Échec critique…' : r.success ? 'Réussite' : 'Échec';
  const tone = r.success ? 'text-mousse-400' : 'text-sang-400';
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center" aria-live="assertive">
      <div className="pointer-events-auto flex flex-col items-center gap-3 rounded-2xl border border-braise-500/40 bg-nuit-900/95 px-10 py-6 shadow-[0_0_60px_-10px_rgba(236,131,54,.6)]" onClick={() => setVisible(false)}>
        <p className="text-sm text-parchemin-300">
          {dice.characterName} — {ABILITY_LABELS[r.ability]} · {r.reason}
        </p>
        <div key={dice.key} className="relative h-28 w-28 animate-tumble">
          <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_0_12px_rgba(236,131,54,.5)]">
            <polygon points="50,3 93,27 93,73 50,97 7,73 7,27" fill="#2a2433" stroke="#ec8336" strokeWidth="3" />
            <polygon points="50,18 80,66 20,66" fill="none" stroke="#ec8336" strokeOpacity=".35" strokeWidth="2" />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center font-titre text-4xl font-bold ${settled ? (r.natural === 20 ? 'text-braise-300' : r.natural === 1 ? 'text-sang-400' : 'text-parchemin-100') : 'text-parchemin-300'}`}>
            {face}
          </span>
        </div>
        {settled && (
          <div className="animate-fadein text-center">
            <p className="text-parchemin-200">
              {r.natural} {r.modifier >= 0 ? '+' : '−'} {Math.abs(r.modifier)} = <strong>{r.total}</strong> contre {r.difficulty}
            </p>
            <p className={`font-titre text-2xl font-bold ${tone}`}>{verdict}</p>
          </div>
        )}
      </div>
    </div>
  );
}
