import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)

  const bulls = await prisma.bull.findMany({
    where: { userId },
    include: {
      _count: { select: { breedings: true, notes: true } },
    },
    orderBy: { name: 'asc' },
  })
  return { success: true, data: bulls }
})
