import type { Cow } from './cow'
import type { Pen } from './pen'
import type { Building } from './building'
import type { Bull } from './bull'

// Type de base
export interface Breeding {
  id: number
  date: string
  isMaybe: boolean
  cowId: number
  bullId: number | null
  bullName: string | null
}

// Pour GET /breedings (liste)
export interface BreedingWithRelations extends Breeding {
  cow: Cow & {
    pen: Pen & { building: Building }
  }
  bull: Bull | null
}
