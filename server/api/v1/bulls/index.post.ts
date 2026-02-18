import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const body = await readBody(event)

  if (!body?.name?.trim()) {
    throw createError({
      statusCode: 400,
      message: 'Le champ "name" est requis',
    })
  }

  const bull = await prisma.bull.create({
    data: { name: body.name.trim() },
  })

  setResponseStatus(event, 201)
  return { success: true, data: bull }
})
