import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const location = await prisma.location.findUnique({
    where: { id },
    include: {
      buildings: {
        include: {
          pens: {
            include: { _count: { select: { cows: true } } },
          },
        },
      },
    },
  })

  if (!location)
    throw createError({ statusCode: 404, message: 'Location introuvable' })

  if (location.userId !== userId)
    throw createError({ statusCode: 403, message: 'Accès interdit' })

  return { success: true, data: location }
})
