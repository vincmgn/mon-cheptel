import { prisma } from '../../utils/prisma'
import { requireUserId } from '../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)
  const query = getQuery(event)
  const q = ((query.q as string) ?? '').trim()

  if (q.length < 2) {
    return {
      success: true,
      data: {
        cows: [],
        bulls: [],
        locations: [],
        buildings: [],
        pens: [],
        calves: [],
      },
    }
  }

  const [cows, bulls, locations, buildings, pens, calves] = await Promise.all([
    prisma.cow.findMany({
      where: {
        officialId: { contains: q, mode: 'insensitive' },
        pen: { building: { location: { userId } } },
      },
      include: {
        pen: { include: { building: { include: { location: true } } } },
      },
      take: 5,
    }),
    prisma.bull.findMany({
      where: {
        name: { contains: q, mode: 'insensitive' },
        userId,
      },
      take: 5,
    }),
    prisma.location.findMany({
      where: {
        name: { contains: q, mode: 'insensitive' },
        userId,
      },
      take: 5,
    }),
    prisma.building.findMany({
      where: {
        name: { contains: q, mode: 'insensitive' },
        location: { userId },
      },
      include: { location: true },
      take: 5,
    }),
    prisma.pen.findMany({
      where: {
        name: { contains: q, mode: 'insensitive' },
        building: { location: { userId } },
      },
      include: { building: { include: { location: true } } },
      take: 5,
    }),
    prisma.calf.findMany({
      where: {
        cow: {
          officialId: { contains: q, mode: 'insensitive' },
          pen: { building: { location: { userId } } },
        },
      },
      include: { cow: true },
      take: 5,
    }),
  ])

  return {
    success: true,
    data: { cows, bulls, locations, buildings, pens, calves },
  }
})
