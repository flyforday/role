import type { Scenario } from '@veillee/engine';
import { clocheSousLeLac } from './cloche-sous-le-lac';
import { terrierRouillepierre } from './terrier-rouillepierre';
import { tourMageAbsent } from './tour-mage-absent';

/** Scénarios prêts à jouer proposés à la création d'une partie. */
export const SCENARIOS: Scenario[] = [clocheSousLeLac, terrierRouillepierre, tourMageAbsent];

export function findScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
