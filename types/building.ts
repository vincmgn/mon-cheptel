import type { Pen } from './pen'

export interface Building {
  id: number
  name: string
  locationId: number
  pens: Pen[]
}
