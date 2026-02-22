import type { H3Event } from 'h3'

/**
 * Récupère l'userId de la session ou lève une 401.
 */
export async function requireUserId(event: H3Event): Promise<number> {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }
  return session.user.id
}
