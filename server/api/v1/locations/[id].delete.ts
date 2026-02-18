import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const existing = await prisma.location.findUnique({ where: { id }, include: { buildings: true } })
  if (!existing)
    throw createError({ statusCode: 404, message: 'Location introuvable' })

  if (existing.buildings.length > 0)
    throw createError({
      statusCode: 409,
      message: `Impossible de supprimer cette location : elle contient ${existing.buildings.length} bâtiment(s). Supprimez-les d'abord.`,
    })

  await prisma.location.delete({ where: { id } })

  return { success: true, message: 'Location supprimée' }
})
