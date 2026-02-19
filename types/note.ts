import type { Cow } from './cow'
import type { Calf } from './calf'
import type { Bull } from './bull'

// Type de base
export interface Note {
  id: number
  content: string
  createdAt: string
  cowId: number | null
  calfId: number | null
  bullId: number | null
}

// Pour GET /notes (liste)
export interface NoteWithRelations extends Note {
  cow: Cow | null
  calf: Calf | null
  bull: Bull | null
}
