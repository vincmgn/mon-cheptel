import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)
  const body = await readBody(event)
  const { calfId, weight, date } = body as {
    calfId: number
    weight: number
    date?: string
  }

  if (!calfId || weight == null) {
    throw createError({ statusCode: 400, message: 'calfId et weight requis' })
  }

  const calf = await prisma.calf.findUnique({
    where: { id: calfId },
    include: { cow: { include: { pen: { include: { building: { include: { location: true } } } } } } },
  })

  if (!calf) throw createError({ statusCode: 404, message: 'Veau introuvable' })
  if (calf.cow.pen.building.location.userId !== userId)
    throw createError({ statusCode: 403, message: 'Accès interdit' })

  const weighing = await prisma.weighing.create({
    data: {
      calfId,
      weight,
      ...(date ? { date: new Date(date) } : {}),
    },
  })

  return { success: true, data: weighing }
})
