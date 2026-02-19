export interface Breeding {
  id: number
  date: Date
  isMaybe: boolean
  cowId: number
  bullId: number | null
  bullName: string | null
}
