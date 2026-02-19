import type { Note } from './note'

export interface Calf {
  id: number
  sex: string
  birthDate: Date
  cowId: number
  notes: Note[]
}
