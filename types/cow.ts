import type { Note } from './note'
import type { Breeding } from './breeding'
import type { Calf } from './calf'

export interface Cow {
  id: number
  officialId: string
  penId: number
  prophylaxis: boolean
  notes: Note[]
  breedings: Breeding[]
  calves: Calf[]
  createdAt: Date
}
