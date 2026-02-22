import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)

  const breedings = await prisma.breeding.findMany({
    where: { cow: { pen: { building: { location: { userId } } } } },
    include: {
      cow: { include: { pen: { include: { building: true } } } },
      bull: true,
    },
    orderBy: { date: 'desc' },
  })
  return { success: true, data: breedings }
})
