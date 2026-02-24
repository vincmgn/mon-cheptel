import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const body = await readBody(event)

  const existing = await prisma.calf.findUnique({
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
    throw createError({ statusCode: 404, message: 'Veau introuvable' })

  if (existing.cow.pen.building.location.userId !== userId)
    throw createError({ statusCode: 403, message: 'Accès interdit' })

  if (body.sex && !['M', 'F'].includes(body.sex)) {
    throw createError({
      statusCode: 400,
      message: 'Le champ "sex" doit être M ou F',
    })
  }

  const calf = await prisma.calf.update({
    where: { id },
    data: {
      ...(body.sex ? { sex: body.sex } : {}),
      ...(body.birthDate ? { birthDate: new Date(body.birthDate) } : {}),
      ...('officialId' in body ? { officialId: body.officialId || null } : {}),
    },
    include: { cow: true },
  })

  return { success: true, data: calf }
})
