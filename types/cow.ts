import type { Pen } from './pen'
import type { Building } from './building'
import type { Location } from './location'
import type { Note } from './note'
import type { Breeding } from './breeding'
import type { Bull } from './bull'

// Type de base
export interface Cow {
  id: number
  officialId: string
  penId: number
  prophylaxis: boolean
  createdAt: string
}

// Pour GET /cows (liste)
export interface CowWithPen extends Cow {
  pen: Pen & {
    building: Building & { location: Location }
  }
  _count: {
    calves: number
    breedings: number
    notes: number
  }
}

// Pour GET /cows/:id (détail)
export interface CowDetail extends Cow {
  pen: Pen & {
    building: Building & { location: Location }
  }
  calves: Array<{
    id: number
    sex: string
    birthDate: string
    cowId: number
    _count: { notes: number }
  }>
  breedings: Array<
    Breeding & {
      bull: Bull | null
    }
  >
  notes: Note[]
}
