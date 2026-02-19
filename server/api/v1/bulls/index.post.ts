import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const body = await readBody(event)

  if (!body?.name?.trim()) {
    throw createError({
      statusCode: 400,
      message: 'Le champ "name" est requis',
    })
  }

  try {
    const bull = await prisma.bull.create({
      data: { name: body.name.trim() },
    })

    setResponseStatus(event, 201)
    return { success: true, data: bull }
  }
  catch (error: any) {
    // Erreur de contrainte d'unicité Prisma
    if (error.code === 'P2002') {
      throw createError({
        statusCode: 409,
        message: `Un taureau avec le nom "${body.name.trim()}" existe déjà`,
      })
    }
    throw error
  }
})
