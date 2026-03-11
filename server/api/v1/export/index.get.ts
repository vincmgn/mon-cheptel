import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)
  const query = getQuery(event)

  const type = query.type as string
  const dateFrom = query.dateFrom
    ? new Date(query.dateFrom as string)
    : undefined
  const dateTo = query.dateTo
    ? new Date((query.dateTo as string) + 'T23:59:59')
    : undefined

  if (type === 'cows') {
    const dateFilter =
      dateFrom || dateTo ? { createdAt: { gte: dateFrom, lte: dateTo } } : {}
    const data = await prisma.cow.findMany({
      where: { pen: { building: { location: { userId } } }, ...dateFilter },
      include: {
        pen: { include: { building: { include: { location: true } } } },
        _count: { select: { calves: true, breedings: true } },
        breedings: {
          orderBy: { date: 'desc' },
          take: 1,
          include: { bull: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, data }
  }

  if (type === 'bulls') {
    const dateFilter =
      dateFrom || dateTo ? { createdAt: { gte: dateFrom, lte: dateTo } } : {}
    const data = await prisma.bull.findMany({
      where: { userId, ...dateFilter },
      include: { _count: { select: { breedings: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, data }
  }

  if (type === 'calves') {
    const dateFilter =
      dateFrom || dateTo ? { birthDate: { gte: dateFrom, lte: dateTo } } : {}
    const data = await prisma.calf.findMany({
      where: {
        cow: { pen: { building: { location: { userId } } } },
        ...dateFilter,
      },
      include: {
        cow: {
          include: {
            pen: { include: { building: { include: { location: true } } } },
          },
        },
      },
      orderBy: { birthDate: 'desc' },
    })
    return { success: true, data }
  }

  if (type === 'breedings') {
    const dateFilter =
      dateFrom || dateTo ? { date: { gte: dateFrom, lte: dateTo } } : {}
    const data = await prisma.breeding.findMany({
      where: {
        cow: { pen: { building: { location: { userId } } } },
        ...dateFilter,
      },
      include: {
        cow: {
          include: {
            pen: { include: { building: { include: { location: true } } } },
          },
        },
        bull: true,
      },
      orderBy: { date: 'desc' },
    })
    return { success: true, data }
  }

  throw createError({
    statusCode: 400,
    message:
      'Type invalide. Valeurs acceptées : cows, bulls, calves, breedings',
  })
})
