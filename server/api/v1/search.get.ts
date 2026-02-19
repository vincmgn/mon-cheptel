import { prisma } from '../../utils/prisma'

export default defineEventHandler(async event => {
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
      where: { officialId: { contains: q, mode: 'insensitive' } },
      include: {
        pen: { include: { building: { include: { location: true } } } },
      },
      take: 5,
    }),
    prisma.bull.findMany({
      where: { name: { contains: q, mode: 'insensitive' } },
      take: 5,
    }),
    prisma.location.findMany({
      where: { name: { contains: q, mode: 'insensitive' } },
      take: 5,
    }),
    prisma.building.findMany({
      where: { name: { contains: q, mode: 'insensitive' } },
      include: { location: true },
      take: 5,
    }),
    prisma.pen.findMany({
      where: { name: { contains: q, mode: 'insensitive' } },
      include: { building: { include: { location: true } } },
      take: 5,
    }),
    prisma.calf.findMany({
      where: { cow: { officialId: { contains: q, mode: 'insensitive' } } },
      include: { cow: true },
      take: 5,
    }),
  ])

  return { success: true, data: { cows, bulls, locations, buildings, pens, calves } }
})
