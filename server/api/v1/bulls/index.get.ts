import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async () => {
  const bulls = await prisma.bull.findMany({
    include: {
      _count: { select: { breedings: true, notes: true } },
    },
    orderBy: { name: 'asc' },
  })
  return { success: true, data: bulls }
})
