import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const body = await readBody(event)

  const existing = await prisma.cow.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, message: 'Vache introuvable' })

  if (body.penId) {
    const penExists = await prisma.pen.findUnique({ where: { id: body.penId } })
    if (!penExists) throw createError({ statusCode: 404, message: 'Box/Enclos introuvable' })
  }

  const cow = await prisma.cow.update({
    where: { id },
    data: {
      ...(body.officialId ? { officialId: body.officialId.trim() } : {}),
      ...(body.penId ? { penId: body.penId } : {}),
      ...(body.prophylaxis !== undefined ? { prophylaxis: body.prophylaxis } : {}),
    },
    include: {
      pen: { include: { building: { include: { location: true } } } },
    },
  })

  return { success: true, data: cow }
})
