import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const body = await readBody(event)
  if (!body?.name?.trim()) {
    throw createError({
      statusCode: 400,
      message: 'Le champ "name" est requis',
    })
  }

  const existing = await prisma.location.findUnique({ where: { id } })
  if (!existing)
    throw createError({ statusCode: 404, message: 'Location introuvable' })

  if (existing.userId !== userId)
    throw createError({ statusCode: 403, message: 'Accès interdit' })

  const existingWithSameName = await prisma.location.findFirst({
    where: {
      name: body.name.trim(),
      userId,
      NOT: { id },
    },
  })

  if (existingWithSameName) {
    throw createError({
      statusCode: 409,
      message: `Une location avec le nom "${body.name.trim()}" existe déjà`,
    })
  }

  const location = await prisma.location.update({
    where: { id },
    data: { name: body.name.trim() },
  })

  return { success: true, data: location }
})
