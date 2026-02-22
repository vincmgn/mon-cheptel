import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const body = await readBody(event)

  const existing = await prisma.breeding.findUnique({
    where: { id },
    include: {
      cow: {
        include: {
          pen: { include: { building: { include: { location: true } } } },
        },
      },
    },
  })
  if (!existing)
    throw createError({ statusCode: 404, message: 'Saillie introuvable' })

  if (existing.cow.pen.building.location.userId !== userId)
    throw createError({ statusCode: 403, message: 'Accès interdit' })

  if (body.bullId) {
    const bullExists = await prisma.bull.findUnique({
      where: { id: body.bullId },
    })
    if (!bullExists)
      throw createError({ statusCode: 404, message: 'Taureau introuvable' })

    if (bullExists.userId !== userId)
      throw createError({ statusCode: 403, message: 'Accès interdit' })
  }

  const breeding = await prisma.breeding.update({
    where: { id },
    data: {
      ...(body.date ? { date: new Date(body.date) } : {}),
      ...(body.isMaybe !== undefined ? { isMaybe: body.isMaybe } : {}),
      ...(body.bullId !== undefined ? { bullId: body.bullId } : {}),
      ...(body.bullName !== undefined ? { bullName: body.bullName } : {}),
    },
    include: { cow: true, bull: true },
  })

  return { success: true, data: breeding }
})
