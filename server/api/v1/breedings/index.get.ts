import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async () => {
  const breedings = await prisma.breeding.findMany({
    include: {
      cow: { include: { pen: { include: { building: true } } } },
      bull: true,
    },
    orderBy: { date: 'desc' },
  })
  return { success: true, data: breedings }
})
