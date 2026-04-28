import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)
  const body = await readBody(event)

  if (!body?.name?.trim()) {
    throw createError({
      statusCode: 400,
      message: 'Le champ "name" est requis',
    })
  }
  if (!body?.locationId) {
    throw createError({
      statusCode: 400,
      message: 'Le champ "locationId" est requis',
    })
  }

  const type = body.type === 'meadow' ? 'meadow' : 'building'

  const locationExists = await prisma.location.findUnique({
    where: { id: body.locationId },
  })
  if (!locationExists)
    throw createError({ statusCode: 404, message: 'Location introuvable' })

  if (locationExists.userId !== userId)
    throw createError({ statusCode: 403, message: 'Accès interdit' })

  const existingBuilding = await prisma.building.findFirst({
    where: {
      name: body.name.trim(),
      locationId: body.locationId,
    },
  })

  if (existingBuilding) {
    throw createError({
      statusCode: 409,
      message: `Un bâtiment avec le nom "${body.name.trim()}" existe déjà dans cette location`,
    })
  }

  const building = await prisma.building.create({
    data: {
      name: body.name.trim(),
      locationId: body.locationId,
      type,
      ...(type === 'meadow'
        ? { pens: { create: { name: body.name.trim() } } }
        : {}),
    },
    include: {
      location: true,
      pens: true,
    },
  })

  setResponseStatus(event, 201)
  return { success: true, data: building }
})
