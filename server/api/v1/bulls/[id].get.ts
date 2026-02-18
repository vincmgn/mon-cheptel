import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const bull = await prisma.bull.findUnique({
    where: { id },
    include: {
      breedings: {
        include: { cow: true },
        orderBy: { date: 'desc' },
      },
      comments: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!bull) throw createError({ statusCode: 404, message: 'Taureau introuvable' })

  return { success: true, data: bull }
})
