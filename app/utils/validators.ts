import type { FormError } from '@nuxt/ui'

export function validateLocationName(state: { name: string }): FormError[] {
  if (!state.name.trim())
    return [{ name: 'name', message: 'Le nom est requis' }]
  return []
}
