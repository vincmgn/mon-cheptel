import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const body = await readBody(event)

  if (!body?.content?.trim()) {
    throw createError({
      statusCode: 400,
      message: 'Le champ "content" est requis',
    })
  }
  if (!body.cowId && !body.calfId && !body.bullId) {
    throw createError({
      statusCode: 400,
      message: 'Un "cowId", "calfId" ou "bullId" est requis',
    })
  }

  if (body.cowId) {
    const cowExists = await prisma.cow.findUnique({ where: { id: body.cowId } })
    if (!cowExists)
      throw createError({ statusCode: 404, message: 'Vache introuvable' })
  }
  if (body.calfId) {
    const calfExists = await prisma.calf.findUnique({
      where: { id: body.calfId },
    })
    if (!calfExists)
      throw createError({ statusCode: 404, message: 'Veau introuvable' })
  }
  if (body.bullId) {
    const bullExists = await prisma.bull.findUnique({
      where: { id: body.bullId },
    })
    if (!bullExists)
      throw createError({ statusCode: 404, message: 'Taureau introuvable' })
  }

  const note = await prisma.note.create({
    data: {
      content: body.content.trim(),
      cowId: body.cowId ?? null,
      calfId: body.calfId ?? null,
      bullId: body.bullId ?? null,
    },
    include: { cow: true, calf: true, bull: true },
  })

  setResponseStatus(event, 201)
  return { success: true, data: note }
})
