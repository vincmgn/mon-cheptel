import type { Building } from './building'
import type { Location } from './location'

// Type de base
export interface Pen {
  id: number
  name: string
  buildingId: number
}

// Pour GET /pens (liste)
export interface PenWithBuilding extends Pen {
  building: Building & { location: Location }
  _count: { cows: number }
}

// Pour GET /pens/:id (détail)
export interface PenWithCows extends Pen {
  building: Building & { location: Location }
  cows: Array<{
    id: number
    officialId: string
    penId: number
    prophylaxis: boolean
    createdAt: string
    _count: {
      calves: number
      breedings: number
    }
  }>
}
