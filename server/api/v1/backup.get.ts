import { prisma } from '../../utils/prisma'
import { requireUserId } from '../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)

  const [bulls, cows, breedings, calves] = await Promise.all([
    prisma.bull.findMany({
      where: { userId },
      select: { name: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.cow.findMany({
      where: { pen: { building: { location: { userId } } } },
      include: {
        pen: { include: { building: { include: { location: true } } } },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.breeding.findMany({
      where: { cow: { pen: { building: { location: { userId } } } } },
      include: {
        cow: { select: { officialId: true } },
        bull: { select: { name: true } },
      },
      orderBy: { date: 'asc' },
    }),
    prisma.calf.findMany({
      where: { cow: { pen: { building: { location: { userId } } } } },
      include: { cow: { select: { officialId: true } } },
      orderBy: { birthDate: 'asc' },
    }),
  ])

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    bulls: bulls.map(b => ({
      name: b.name,
      createdAt: b.createdAt.toISOString().slice(0, 10),
    })),
    cows: cows.map(c => ({
      officialId: c.officialId,
      location: c.pen.building.location.name,
      building: c.pen.building.name,
      pen: c.pen.name,
      prophylaxis: c.prophylaxis,
      createdAt: c.createdAt.toISOString().slice(0, 10),
    })),
    breedings: breedings.map(b => ({
      date: b.date.toISOString().slice(0, 10),
      cowOfficialId: b.cow.officialId,
      bullName: b.bull?.name ?? b.bullName ?? null,
      isMaybe: b.isMaybe,
    })),
    calves: calves.map(c => ({
      officialId: c.officialId ?? null,
      sex: c.sex,
      birthDate: c.birthDate.toISOString().slice(0, 10),
      motherOfficialId: c.cow.officialId,
    })),
  }
})
