import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)

  const cows = await prisma.cow.findMany({
    where: { pen: { building: { location: { userId } } } },
    include: {
      pen: { include: { building: { include: { location: true } } } },
      _count: { select: { calves: true, breedings: true, notes: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return { success: true, data: cows }
})
