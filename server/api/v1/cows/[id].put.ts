import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const body = await readBody(event)

  const existing = await prisma.cow.findUnique({ where: { id } })
  if (!existing)
    throw createError({ statusCode: 404, message: 'Vache introuvable' })

  if (body.penId) {
    const penExists = await prisma.pen.findUnique({ where: { id: body.penId } })
    if (!penExists)
      throw createError({ statusCode: 404, message: 'Box/Enclos introuvable' })
  }

  try {
    const cow = await prisma.cow.update({
      where: { id },
      data: {
        ...(body.officialId ? { officialId: body.officialId.trim() } : {}),
        ...(body.penId ? { penId: body.penId } : {}),
        ...(body.prophylaxis !== undefined
          ? { prophylaxis: body.prophylaxis }
          : {}),
      },
      include: {
        pen: { include: { building: { include: { location: true } } } },
      },
    })

    return { success: true, data: cow }
  }
  catch (error: any) {
    // Erreur de contrainte d'unicité Prisma pour officialId
    if (error.code === 'P2002') {
      throw createError({
        statusCode: 409,
        message: `Une vache avec l'identifiant "${body.officialId?.trim()}" existe déjà`,
      })
    }
    throw error
  }
})
