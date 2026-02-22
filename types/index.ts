export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiList<T = unknown> extends ApiResponse<T[]> {
  data: T[]
}

export interface Stats {
  cows: number
  calves: number
  bulls: number
}

export type SearchResults = {
  cows: Array<{
    id: number
    officialId: string
    pen: {
      id: number
      name: string
      building: {
        id: number
        name: string
        location: { id: number; name: string }
      }
    }
  }>
  bulls: Array<{ id: number; name: string }>
  locations: Array<{ id: number; name: string }>
  buildings: Array<{
    id: number
    name: string
    location: { id: number; name: string }
  }>
  pens: Array<{
    id: number
    name: string
    building: {
      id: number
      name: string
      location: { id: number; name: string }
    }
  }>
}

export * from './user'
export * from './location'
export * from './building'
export * from './pen'
export * from './cow'
export * from './bull'
export * from './calf'
export * from './breeding'
export * from './note'
