import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const building = await prisma.building.findUnique({
    where: { id },
    include: {
      location: true,
      pens: {
        include: { _count: { select: { cows: true } } },
      },
    },
  })

  if (!building)
    throw createError({ statusCode: 404, message: 'Bâtiment introuvable' })

  if (building.location.userId !== userId)
    throw createError({ statusCode: 403, message: 'Accès interdit' })

  return { success: true, data: building }
})
