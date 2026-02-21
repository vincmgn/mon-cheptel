import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const body = await readBody(event)

  if (!body?.officialId?.trim()) {
    throw createError({
      statusCode: 400,
      message: 'Le champ "officialId" est requis',
    })
  }
  if (!body?.penId) {
    throw createError({
      statusCode: 400,
      message: 'Le champ "penId" est requis',
    })
  }

  const penExists = await prisma.pen.findUnique({ where: { id: body.penId } })
  if (!penExists)
    throw createError({ statusCode: 404, message: 'Box/Enclos introuvable' })

  try {
    const cow = await prisma.cow.create({
      data: {
        officialId: body.officialId.trim(),
        penId: body.penId,
        prophylaxis: body.prophylaxis ?? false,
      },
      include: {
        pen: { include: { building: { include: { location: true } } } },
      },
    })

    setResponseStatus(event, 201)
    return { success: true, data: cow }
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2002') {
      throw createError({
        statusCode: 409,
        message: `Une vache avec l'identifiant "${body.officialId.trim()}" existe déjà`,
      })
    }
    throw error
  }
})
