export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiList<T = unknown> extends ApiResponse<T[]> {
  data: T[]
}

export * from './location'
export * from './building'
export * from './pen'
export * from './cow'
export * from './bull'
export * from './calf'
export * from './breeding'
export * from './note'
