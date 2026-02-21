import { FetchError } from 'ofetch'

/**
 * Extrait le message d'erreur depuis n'importe quel type d'erreur.
 * - FetchError (erreur $fetch Nuxt) → utilise e.data.message
 * - Error standard JS → utilise e.message
 * - Autre → message de fallback
 */
export function getErrorMessage(
  e: unknown,
  fallback = 'Une erreur est survenue'
): string {
  if (e instanceof FetchError) {
    return e.data?.message ?? fallback
  }
  if (e instanceof Error) {
    return e.message
  }
  return fallback
}
