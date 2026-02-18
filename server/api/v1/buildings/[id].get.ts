import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
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

  if (!building) throw createError({ statusCode: 404, message: 'Bâtiment introuvable' })

  return { success: true, data: building }
})
