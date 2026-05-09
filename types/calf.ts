import type { Cow } from './cow'
import type { Pen } from './pen'
import type { Building } from './building'

export interface Weighing {
  id: number
  date: string
  weight: number
  calfId: number
}

// Type de base
export interface Calf {
  id: number
  officialId: string | null
  sex: string
  birthDate: string
  cowId: number
}

// Pour GET /calves (liste)
export interface CalfWithCow extends Calf {
  cow: Cow & {
    pen: Pen & { building: Building }
  }
  _count: { notes: number }
}
