import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async () => {
  const cows = await prisma.cow.findMany({
    include: {
      pen: { include: { building: { include: { location: true } } } },
      _count: { select: { calves: true, breedings: true, notes: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return { success: true, data: cows }
})
