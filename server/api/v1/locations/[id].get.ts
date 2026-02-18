import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
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

  if (!location) throw createError({ statusCode: 404, message: 'Location introuvable' })

  return { success: true, data: location }
})
