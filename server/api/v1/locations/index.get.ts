import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)

  const locations = await prisma.location.findMany({
    where: { userId },
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
