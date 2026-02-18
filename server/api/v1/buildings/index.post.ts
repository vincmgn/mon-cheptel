import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
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

  const locationExists = await prisma.location.findUnique({
    where: { id: body.locationId },
  })
  if (!locationExists)
    throw createError({ statusCode: 404, message: 'Location introuvable' })

  const building = await prisma.building.create({
    data: { name: body.name.trim(), locationId: body.locationId },
    include: { location: true },
  })

  setResponseStatus(event, 201)
  return { success: true, data: building }
})
