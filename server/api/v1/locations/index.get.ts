import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async () => {
  const locations = await prisma.location.findMany({
    include: {
      buildings: {
        include: {
          _count: { select: { pens: true } },
        },
      },
    },
    orderBy: { id: 'asc' },
  })
  return { success: true, data: locations }
})
