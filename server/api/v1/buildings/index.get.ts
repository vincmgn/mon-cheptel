import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async () => {
  const buildings = await prisma.building.findMany({
    include: {
      location: true,
      _count: { select: { pens: true } },
    },
    orderBy: { id: 'asc' },
  })
  return { success: true, data: buildings }
})
