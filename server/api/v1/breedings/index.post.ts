import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const body = await readBody(event)

  if (!body?.cowId) {
    throw createError({
      statusCode: 400,
      message: 'Le champ "cowId" est requis',
    })
  }
  if (!body.bullId && !body.bullName) {
    throw createError({
      statusCode: 400,
      message: 'Un "bullId" ou un "bullName" est requis',
    })
  }

  const cowExists = await prisma.cow.findUnique({ where: { id: body.cowId } })
  if (!cowExists)
    throw createError({ statusCode: 404, message: 'Vache introuvable' })

  if (body.bullId) {
    const bullExists = await prisma.bull.findUnique({
      where: { id: body.bullId },
    })
    if (!bullExists)
      throw createError({ statusCode: 404, message: 'Taureau introuvable' })
  }

  const breeding = await prisma.breeding.create({
    data: {
      date: body.date ? new Date(body.date) : new Date(),
      isMaybe: body.isMaybe ?? false,
      cowId: body.cowId,
      bullId: body.bullId ?? null,
      bullName: body.bullName ?? null,
    },
    include: { cow: true, bull: true },
  })

  setResponseStatus(event, 201)
  return { success: true, data: breeding }
})
