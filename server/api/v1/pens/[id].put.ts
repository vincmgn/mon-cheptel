import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const body = await readBody(event)
  if (!body?.name?.trim()) {
    throw createError({
      statusCode: 400,
      message: 'Le champ "name" est requis',
    })
  }

  const existing = await prisma.pen.findUnique({ where: { id } })
  if (!existing)
    throw createError({ statusCode: 404, message: 'Box/Enclos introuvable' })

  const buildingId = body.buildingId || existing.buildingId

  if (body.buildingId) {
    const buildingExists = await prisma.building.findUnique({
      where: { id: body.buildingId },
    })
    if (!buildingExists)
      throw createError({ statusCode: 404, message: 'Bâtiment introuvable' })
  }

  // Vérifier qu'aucun autre pen n'a le même nom dans ce bâtiment
  const existingWithSameName = await prisma.pen.findFirst({
    where: {
      name: body.name.trim(),
      buildingId,
      NOT: { id },
    },
  })

  if (existingWithSameName) {
    throw createError({
      statusCode: 409,
      message: `Un enclos avec le nom "${body.name.trim()}" existe déjà dans ce bâtiment`,
    })
  }

  const pen = await prisma.pen.update({
    where: { id },
    data: {
      name: body.name.trim(),
      ...(body.buildingId ? { buildingId: body.buildingId } : {}),
    },
    include: { building: { include: { location: true } } },
  })

  return { success: true, data: pen }
})
