import type { Cow } from './cow'

export interface Pen {
  id: number
  name: string
  buildingId: number
  cows: Cow[]
}
