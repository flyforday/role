import type { Abilities } from './types';

export interface CharacterClass {
  id: string;
  name: string;
  description: string;
  abilities: Abilities;
  weaponId: string;
}

// Les classes proposent une identité et une répartition de départ, sans bonus caché.
const martial: Abilities = { force: 3, agilite: 1, endurance: 2, intelligence: -1, perception: 1, charisme: 0 };
const agile: Abilities = { force: 0, agilite: 3, endurance: 1, intelligence: 0, perception: 2, charisme: 0 };
const savant: Abilities = { force: -1, agilite: 1, endurance: 0, intelligence: 3, perception: 2, charisme: 1 };
const social: Abilities = { force: -1, agilite: 2, endurance: 0, intelligence: 1, perception: 1, charisme: 3 };
const gardien: Abilities = { force: 2, agilite: 0, endurance: 2, intelligence: 0, perception: 0, charisme: 2 };
const mystique: Abilities = { force: 0, agilite: 1, endurance: 1, intelligence: 2, perception: 2, charisme: 0 };

export const CHARACTER_CLASSES: readonly CharacterClass[] = [
  { id: 'guerrier', name: 'Guerrier', description: 'Mercenaire, garde ou vétéran : vous affrontez le danger en première ligne.', abilities: martial, weaponId: 'arme-hache' },
  { id: 'rodeur', name: 'Rôdeur', description: 'Éclaireur des grands espaces, vous lisez les pistes et veillez dans l’ombre des bois.', abilities: agile, weaponId: 'arme-arc' },
  { id: 'mage', name: 'Mage', description: 'Vous explorez les arcanes, les vieux grimoires et les mystères oubliés.', abilities: savant, weaponId: 'arme-baton' },
  { id: 'voleur', name: 'Voleur', description: 'Serrures, ruelles et secrets : votre agilité ouvre les chemins dérobés.', abilities: agile, weaponId: 'arme-dague' },
  { id: 'barde', name: 'Barde', description: 'Artiste et conteur, vous faites des mots, de la musique et des rencontres vos alliés.', abilities: social, weaponId: 'arme-dague' },
  { id: 'druide', name: 'Druide', description: 'Gardien du vivant, vous écoutez les forêts et les cycles de la nature.', abilities: mystique, weaponId: 'arme-baton' },
  { id: 'paladin', name: 'Paladin', description: 'Un serment guide votre lame : protéger, réparer ou rendre justice.', abilities: gardien, weaponId: 'arme-epee' },
  { id: 'alchimiste', name: 'Alchimiste', description: 'Fioles, recettes et curiosité : vous cherchez une solution à chaque énigme.', abilities: savant, weaponId: 'arme-baton' },
  { id: 'moine', name: 'Moine', description: 'Discipline et mouvement vous accompagnent sur les routes de l’aventure.', abilities: agile, weaponId: 'arme-baton' },
  { id: 'pretre', name: 'Prêtre', description: 'Vous portez une conviction, une tradition ou l’espoir d’un refuge pour tous.', abilities: gardien, weaponId: 'arme-baton' },
  { id: 'necromancien', name: 'Nécromancien', description: 'Vous étudiez les traces des morts et les frontières de l’invisible.', abilities: savant, weaponId: 'arme-baton' },
  { id: 'artificier', name: 'Artificier', description: 'Inventeur de terrain, vous assemblez outils ingénieux et mécanismes insolites.', abilities: savant, weaponId: 'arme-dague' },
  { id: 'duelliste', name: 'Duelliste', description: 'Précision, sang-froid et panache font de chaque affrontement une affaire personnelle.', abilities: { force: 1, agilite: 3, endurance: 0, intelligence: 0, perception: 1, charisme: 1 }, weaponId: 'arme-epee' },
  { id: 'chasseur', name: 'Chasseur', description: 'Patient et tenace, vous connaissez les bêtes, les pièges et les sentiers sauvages.', abilities: agile, weaponId: 'arme-arc' },
  { id: 'navigateur', name: 'Navigateur', description: 'Marin ou explorateur, vous gardez le cap entre tempêtes et terres inconnues.', abilities: { force: 1, agilite: 2, endurance: 1, intelligence: 0, perception: 2, charisme: 0 }, weaponId: 'arme-epee' },
  { id: 'chamane', name: 'Chamane', description: 'Vous cherchez conseil auprès des esprits et des souvenirs du monde.', abilities: mystique, weaponId: 'arme-baton' },
];

export const CUSTOM_CLASS_ID = 'personnalisee';

export function characterClass(id: unknown): CharacterClass | undefined {
  return CHARACTER_CLASSES.find((entry) => entry.id === id);
}

