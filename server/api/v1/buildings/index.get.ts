import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)

  const buildings = await prisma.building.findMany({
    where: { location: { userId } },
    include: {
      location: true,
      _count: { select: { pens: true } },
    },
    orderBy: { id: 'asc' },
  })
  return { success: true, data: buildings }
})
