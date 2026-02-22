import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const body = await readBody(event)
  if (!body?.name?.trim()) {
    throw createError({
      statusCode: 400,
      message: 'Le champ "name" est requis',
    })
  }

  const existing = await prisma.building.findUnique({
    where: { id },
    include: { location: true },
  })
  if (!existing)
    throw createError({ statusCode: 404, message: 'Bâtiment introuvable' })

  if (existing.location.userId !== userId)
    throw createError({ statusCode: 403, message: 'Accès interdit' })

  const locationId = body.locationId || existing.locationId

  if (body.locationId) {
    const locationExists = await prisma.location.findUnique({
      where: { id: body.locationId },
    })
    if (!locationExists)
      throw createError({ statusCode: 404, message: 'Location introuvable' })

    if (locationExists.userId !== userId)
      throw createError({ statusCode: 403, message: 'Accès interdit' })
  }

  // Vérifier qu'aucun autre building n'a le même nom dans cette location
  const existingWithSameName = await prisma.building.findFirst({
    where: {
      name: body.name.trim(),
      locationId,
      NOT: { id },
    },
  })

  if (existingWithSameName) {
    throw createError({
      statusCode: 409,
      message: `Un bâtiment avec le nom "${body.name.trim()}" existe déjà dans cette location`,
    })
  }

  const building = await prisma.building.update({
    where: { id },
    data: {
      name: body.name.trim(),
      ...(body.locationId ? { locationId: body.locationId } : {}),
    },
    include: { location: true },
  })

  return { success: true, data: building }
})
