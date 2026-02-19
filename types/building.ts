import type { Location } from './location'

// Type de base
export interface Building {
  id: number
  name: string
  locationId: number
}

// Pour GET /buildings (liste) - avec count
export interface BuildingWithCount extends Building {
  location: Location
  _count: { pens: number }
}

// Pour GET /buildings/:id (détail) - avec pens
export interface BuildingWithPens extends Building {
  location: Location
  pens: Array<{
    id: number
    name: string
    buildingId: number
    _count: { cows: number }
  }>
}
