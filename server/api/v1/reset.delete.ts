import { prisma } from '../../utils/prisma'
import { requireUserId } from '../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)

  // Ordre : dépendants en premier
  const [deletedCalves, deletedBreedings, deletedCows, deletedBulls] = await Promise.all([
    prisma.calf.deleteMany({
      where: { cow: { pen: { building: { location: { userId } } } } },
    }),
    prisma.breeding.deleteMany({
      where: { cow: { pen: { building: { location: { userId } } } } },
    }),
    prisma.cow.deleteMany({
      where: { pen: { building: { location: { userId } } } },
    }),
    prisma.bull.deleteMany({ where: { userId } }),
  ])

  return {
    success: true,
    data: {
      calves: deletedCalves.count,
      breedings: deletedBreedings.count,
      cows: deletedCows.count,
      bulls: deletedBulls.count,
    },
  }
})
