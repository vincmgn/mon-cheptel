import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const existing = await prisma.calf.findUnique({
    where: { id },
    include: {
      cow: {
        include: {
          pen: { include: { building: { include: { location: true } } } },
        },
      },
    },
  })
  if (!existing)
    throw createError({ statusCode: 404, message: 'Veau introuvable' })

  if (existing.cow.pen.building.location.userId !== userId)
    throw createError({ statusCode: 403, message: 'Accès interdit' })

  await prisma.calf.delete({ where: { id } })

  return { success: true, message: 'Veau supprimé' }
})
