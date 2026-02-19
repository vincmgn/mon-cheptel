import type { Note } from './note'
import type { Breeding } from './breeding'

export interface Bull {
  id: number
  name: string
  notes: Note[]
  breedings: Breeding[]
  createdAt: Date
}
