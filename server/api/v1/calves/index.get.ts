import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async () => {
  const calves = await prisma.calf.findMany({
    include: {
      cow: { include: { pen: { include: { building: true } } } },
      _count: { select: { comments: true } },
    },
    orderBy: { birthDate: 'desc' },
  })
  return { success: true, data: calves }
})
