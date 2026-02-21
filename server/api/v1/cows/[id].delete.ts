import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const existing = await prisma.cow.findUnique({
    where: { id },
    include: { calves: true, breedings: true },
  })
  if (!existing)
    throw createError({ statusCode: 404, message: 'Vache introuvable' })

  if (existing.calves.length > 0)
    throw createError({
      statusCode: 409,
      message: `Impossible de supprimer cette vache : elle a ${existing.calves.length} veau(x) associé(s). Supprimez-les d'abord.`,
    })

  if (existing.breedings.length > 0)
    throw createError({
      statusCode: 409,
      message: `Impossible de supprimer cette vache : elle a ${existing.breedings.length} saillie(s) associée(s). Supprimez-les d'abord.`,
    })

  await prisma.cow.delete({ where: { id } })

  return { success: true, message: 'Vache supprimée' }
})
