import { resolvePortrait } from '@veillee/engine';

// Les chemins relatifs respectent aussi les installations dans un sous-dossier.
const atlases = import.meta.glob('../assets/portraits/*.jpg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

export function CharacterPortrait({ portraitId, name, className = '' }: { portraitId?: string; name: string; className?: string }) {
  const portrait = resolvePortrait(portraitId);
  const source = portrait && atlases[`../assets/portraits/${portrait.raceId}.jpg`];
  return (
    <span
      role="img"
      aria-label={source ? `Portrait de ${name}` : `Initiale de ${name}`}
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-nuit-800 font-titre text-3xl text-braise-300 ${className}`}
      style={source && portrait ? {
        backgroundImage: `url("${source}")`,
        backgroundSize: '200% 100%',
        backgroundPosition: `${portrait.index * 100}% 50%`,
      } : undefined}
    >
      {!source && (name.trim().charAt(0).toLocaleUpperCase('fr-FR') || '?')}
    </span>
  );
}
