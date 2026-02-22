import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)

  const calves = await prisma.calf.findMany({
    where: { cow: { pen: { building: { location: { userId } } } } },
    include: {
      cow: { include: { pen: { include: { building: true } } } },
      _count: { select: { notes: true } },
    },
    orderBy: { birthDate: 'desc' },
  })
  return { success: true, data: calves }
})
