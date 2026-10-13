import { batteurDuDessus } from './scenarios/batteur-du-dessus'
import { colisFantome } from './scenarios/colis-fantome'
import { depotDeGarantie } from './scenarios/depot-de-garantie'
import { voisinDuDessus } from './scenarios/voisin-du-dessus'
import type { ScenarioInput } from './schema'

// Role-play scenarios (see src/shared/README.md to write one), one file each in scenarios/.
// Field names in English, content in French (shown to users). Listed by level on
// /mise-en-situation, in this order inside a level.
export const scenariosData: ScenarioInput[] = [
  voisinDuDessus,
  batteurDuDessus,
  colisFantome,
  depotDeGarantie,
]
