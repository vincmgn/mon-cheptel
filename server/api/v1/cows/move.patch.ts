import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)
  const body = await readBody(event)

  if (!Array.isArray(body?.cowIds) || body.cowIds.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Le champ "cowIds" est requis et doit être un tableau non vide',
    })
  }
  if (!body?.targetPenId) {
    throw createError({
      statusCode: 400,
      message: 'Le champ "targetPenId" est requis',
    })
  }

  const targetPen = await prisma.pen.findUnique({
    where: { id: body.targetPenId },
    include: { building: { include: { location: true } } },
  })
  if (!targetPen)
    throw createError({ statusCode: 404, message: 'Case introuvable' })
  if (targetPen.building.location.userId !== userId)
    throw createError({ statusCode: 403, message: 'Accès interdit' })

  const result = await prisma.cow.updateMany({
    where: {
      id: { in: body.cowIds },
      pen: { building: { location: { userId } } },
    },
    data: { penId: body.targetPenId },
  })

  return { success: true, data: { count: result.count } }
})
