export interface CharacterRace {
  id: string;
  name: string;
  description: string;
}

/** Choix d’identité et d’apparence, sans bonus ni règle de combat supplémentaire. */
export const CHARACTER_RACES: readonly CharacterRace[] = [
  { id: 'humain', name: 'Humain', description: 'Des visages, des carnations et des horizons variés.' },
  { id: 'elfe', name: 'Elfe', description: 'Des oreilles longues et pointues, des traits fins et un regard curieux.' },
  { id: 'nain', name: 'Nain', description: 'Une allure robuste, un visage large et des chevelures épaisses.' },
  { id: 'orc', name: 'Orc', description: 'Une peau verte ou grise, une mâchoire puissante et des défenses apparentes.' },
  { id: 'demi-orc', name: 'Demi-orc', description: 'Des traits humains, de petites défenses et des nuances de peau verdâtres.' },
  { id: 'demi-elfe', name: 'Demi-elfe', description: 'Des traits humains et des oreilles délicatement pointues.' },
  { id: 'gobelin', name: 'Gobelin', description: 'De grandes oreilles, des yeux expressifs et un sourire plein de caractère.' },
  { id: 'gnome', name: 'Gnome', description: 'Un nez marqué, des traits vifs et une allure espiègle.' },
  { id: 'halfelin', name: 'Halfelin', description: 'Un visage rond, des boucles et une expression chaleureuse.' },
  { id: 'drakeide', name: 'Drakéide', description: 'Un visage reptilien, des écailles colorées et des cornes.' },
  { id: 'felin', name: 'Félin', description: 'Un visage de félin, du pelage, des moustaches et des oreilles animales.' },
  { id: 'cornu', name: 'Cornu', description: 'Un visage humanoïde, des cornes et des yeux singuliers.' },
];

export function characterRace(id: unknown): CharacterRace | undefined {
  return CHARACTER_RACES.find((entry) => entry.id === id);
}

/** Identifiants stables : aucune URL ni image encodée dans l’état du jeu. */
export function portraitsForRace(raceId: string): string[] {
  return characterRace(raceId) ? [`${raceId}-1`, `${raceId}-2`] : [];
}

export function resolvePortrait(id: unknown): { raceId: string; index: number } | undefined {
  if (typeof id !== 'string') return;
  const match = /^([a-z]+(?:-[a-z]+)?)-([12])$/.exec(id);
  if (!match || match[0] !== id || !characterRace(match[1])) return;
  return { raceId: match[1], index: Number(match[2]) - 1 };
}
