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

  const existingLocation = await prisma.location.findFirst({
    where: { name: body.name.trim(), userId },
  })

  if (existingLocation) {
    throw createError({
      statusCode: 409,
      message: `Une location avec le nom "${body.name.trim()}" existe déjà`,
    })
  }

  const location = await prisma.location.create({
    data: { name: body.name.trim(), userId },
  })

  setResponseStatus(event, 201)
  return { success: true, data: location }
})
