import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const pen = await prisma.pen.findUnique({
    where: { id },
    include: {
      building: { include: { location: true } },
      cows: {
        include: { _count: { select: { calves: true, breedings: true } } },
      },
    },
  })

  if (!pen) throw createError({ statusCode: 404, message: 'Box/Enclos introuvable' })

  return { success: true, data: pen }
})
