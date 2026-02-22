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

  try {
    const bull = await prisma.bull.create({
      data: { name: body.name.trim(), userId },
    })

    setResponseStatus(event, 201)
    return { success: true, data: bull }
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2002') {
      throw createError({
        statusCode: 409,
        message: `Un taureau avec le nom "${body.name.trim()}" existe déjà`,
      })
    }
    throw error
  }
})
