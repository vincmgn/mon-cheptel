import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const calf = await prisma.calf.findUnique({
    where: { id },
    include: {
      cow: {
        include: {
          pen: { include: { building: { include: { location: true } } } },
        },
      },
      comments: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!calf) throw createError({ statusCode: 404, message: 'Veau introuvable' })

  return { success: true, data: calf }
})
