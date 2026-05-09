import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const cow = await prisma.cow.findUnique({
    where: { id },
    include: {
      pen: { include: { building: { include: { location: true } } } },
      calves: {
        include: {
          _count: { select: { notes: true } },
          weighings: { orderBy: { date: 'desc' } },
        },
        orderBy: { birthDate: 'desc' },
      },
      breedings: { include: { bull: true }, orderBy: { date: 'desc' } },
      notes: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!cow) throw createError({ statusCode: 404, message: 'Vache introuvable' })

  if (cow.pen.building.location.userId !== userId)
    throw createError({ statusCode: 403, message: 'Accès interdit' })

  return { success: true, data: cow }
})
