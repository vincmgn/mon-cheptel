/**
 * Réponse générique de l'API
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Réponse API avec liste
 */
export interface ApiList<T> {
  success: boolean
  data: T[]
}

// ---- Modèles ----

export interface Location {
  id: number
  name: string
  buildings: Building[]
}

export interface Building {
  id: number
  name: string
  locationId: number
  location?: Location
  pens?: Pen[]
  _count?: { pens: number }
}

export interface Pen {
  id: number
  name: string
  buildingId: number
  building?: Building
  cows?: Cow[]
  _count?: { cows: number }
}

export interface Cow {
  id: number
  officialId: string
  penId: number
  pen?: Pen
  prophylaxis: boolean
  createdAt: string
  calves?: Calf[]
  breedings?: Breeding[]
  notes?: Note[]
  _count?: { calves: number; breedings: number; notes: number }
}

export interface Calf {
  id: number
  sex: string
  birthDate: string
  cowId: number
  cow?: Cow
  notes?: Note[]
  _count?: { notes: number }
}

export interface Bull {
  id: number
  name: string
  createdAt: string
  breedings?: Breeding[]
  notes?: Note[]
  _count?: { breedings: number; notes: number }
}

export interface Breeding {
  id: number
  date: string
  isMaybe: boolean
  cowId: number
  cow?: Cow
  bullId?: number
  bull?: Bull
  bullName?: string
}

export interface Note {
  id: number
  content: string
  createdAt: string
  cowId?: number
  cow?: Cow
  calfId?: number
  calf?: Calf
  bullId?: number
  bull?: Bull
}
