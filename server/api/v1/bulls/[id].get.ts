import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const bull = await prisma.bull.findUnique({
    where: { id },
    include: {
      breedings: {
        include: { cow: true },
        orderBy: { date: 'desc' },
      },
      notes: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!bull)
    throw createError({ statusCode: 404, message: 'Taureau introuvable' })

  if (bull.userId !== userId)
    throw createError({ statusCode: 403, message: 'Accès interdit' })

  return { success: true, data: bull }
})
