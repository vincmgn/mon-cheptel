import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const body = await readBody(event)

  if (!body?.name?.trim()) {
    throw createError({ statusCode: 400, message: 'Le champ "name" est requis' })
  }
  if (!body?.buildingId) {
    throw createError({ statusCode: 400, message: 'Le champ "buildingId" est requis' })
  }

  const buildingExists = await prisma.building.findUnique({ where: { id: body.buildingId } })
  if (!buildingExists) throw createError({ statusCode: 404, message: 'Bâtiment introuvable' })

  const pen = await prisma.pen.create({
    data: { name: body.name.trim(), buildingId: body.buildingId },
    include: { building: { include: { location: true } } },
  })

  setResponseStatus(event, 201)
  return { success: true, data: pen }
})
