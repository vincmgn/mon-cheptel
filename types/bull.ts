import type { Note } from './note'
import type { Cow } from './cow'

// Type de base
export interface Bull {
  id: number
  name: string
  createdAt: string
}

// Pour GET /bulls (liste)
export interface BullWithCount extends Bull {
  _count: {
    breedings: number
    notes: number
  }
}

// Pour GET /bulls/:id (détail)
export interface BullDetail extends Bull {
  breedings: Array<{
    id: number
    date: string
    isMaybe: boolean
    cowId: number
    bullId: number | null
    bullName: string | null
    cow: Cow
  }>
  notes: Note[]
}
