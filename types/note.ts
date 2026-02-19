export interface Note {
  id: number
  content: string
  createdAt: Date
  cowId: number | null
  calfId: number | null
  bullId: number | null
}
