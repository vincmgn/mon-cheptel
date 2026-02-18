import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const body = await readBody(event)
  if (!body?.name?.trim()) {
    throw createError({ statusCode: 400, message: 'Le champ "name" est requis' })
  }

  const existing = await prisma.building.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, message: 'Bâtiment introuvable' })

  if (body.locationId) {
    const locationExists = await prisma.location.findUnique({ where: { id: body.locationId } })
    if (!locationExists) throw createError({ statusCode: 404, message: 'Location introuvable' })
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
