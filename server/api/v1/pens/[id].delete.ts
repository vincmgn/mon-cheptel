import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const existing = await prisma.pen.findUnique({
    where: { id },
    include: {
      building: { include: { location: true } },
      cows: true,
    },
  })
  if (!existing)
    throw createError({ statusCode: 404, message: 'Box/Enclos introuvable' })

  if (existing.building.location.userId !== userId)
    throw createError({ statusCode: 403, message: 'Accès interdit' })

  if (existing.cows.length > 0)
    throw createError({
      statusCode: 409,
      message: `Impossible de supprimer cet enclos : il contient ${existing.cows.length} vache(s). Déplacez-les d'abord.`,
    })

  await prisma.pen.delete({ where: { id } })

  return { success: true, message: 'Box/Enclos supprimé' }
})
