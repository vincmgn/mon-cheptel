import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const weighing = await prisma.weighing.findUnique({
    where: { id },
    include: {
      calf: {
        include: { cow: { include: { pen: { include: { building: { include: { location: true } } } } } } },
      },
    },
  })

  if (!weighing) throw createError({ statusCode: 404, message: 'Pesée introuvable' })
  if (weighing.calf.cow.pen.building.location.userId !== userId)
    throw createError({ statusCode: 403, message: 'Accès interdit' })

  await prisma.weighing.delete({ where: { id } })

  return { success: true }
})
