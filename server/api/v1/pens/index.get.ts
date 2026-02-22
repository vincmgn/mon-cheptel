import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)

  const pens = await prisma.pen.findMany({
    where: { building: { location: { userId } } },
    include: {
      building: { include: { location: true } },
      _count: { select: { cows: true } },
    },
    orderBy: { id: 'asc' },
  })
  return { success: true, data: pens }
})
