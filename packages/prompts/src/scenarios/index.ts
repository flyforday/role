import type { Scenario } from '@veillee/engine';
import { clocheSousLeLac } from './cloche-sous-le-lac';
import { gobelinsClaymores } from './gobelins-claymores';
import { mystereVendras } from './mystere-vendras';
import { terrierRouillepierre } from './terrier-rouillepierre';
import { tourMageAbsent } from './tour-mage-absent';
import { ventsHurlants } from './vents-hurlants';

/** Scénarios prêts à jouer proposés à la création d'une partie. */
export const SCENARIOS: Scenario[] = [clocheSousLeLac, terrierRouillepierre, tourMageAbsent, gobelinsClaymores, mystereVendras, ventsHurlants];

export function findScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
