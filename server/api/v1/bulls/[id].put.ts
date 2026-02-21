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

  const existing = await prisma.bull.findUnique({ where: { id } })
  if (!existing)
    throw createError({ statusCode: 404, message: 'Taureau introuvable' })

  try {
    const bull = await prisma.bull.update({
      where: { id },
      data: { name: body.name.trim() },
    })

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
