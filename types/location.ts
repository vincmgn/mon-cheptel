import type { Building } from './building'

export interface Location {
  id: number
  name: string
  buildings: Building[]
}
