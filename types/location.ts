import type { Building, BuildingWithCount } from './building'

// Type de base
export interface Location {
  id: number
  name: string
}

// Pour GET /locations (liste)
export interface LocationWithBuildingsCount extends Location {
  buildings: BuildingWithCount[]
}

// Pour GET /locations/:id (détail)
export interface LocationWithBuildingsDetail extends Location {
  buildings: (Building & {
    pens: Array<{
      id: number
      name: string
      buildingId: number
      _count: { cows: number }
    }>
  })[]
}
