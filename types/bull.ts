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
