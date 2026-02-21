import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const cow = await prisma.cow.findUnique({
    where: { id },
    include: {
      pen: { include: { building: { include: { location: true } } } },
      calves: { include: { _count: { select: { notes: true } } } },
      breedings: { include: { bull: true }, orderBy: { date: 'desc' } },
      notes: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!cow) throw createError({ statusCode: 404, message: 'Vache introuvable' })

  return { success: true, data: cow }
})
