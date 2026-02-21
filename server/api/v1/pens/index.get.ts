import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async () => {
  const pens = await prisma.pen.findMany({
    include: {
      building: { include: { location: true } },
      _count: { select: { cows: true } },
    },
    orderBy: { id: 'asc' },
  })
  return { success: true, data: pens }
})
