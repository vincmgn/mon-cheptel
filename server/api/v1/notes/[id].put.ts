import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const body = await readBody(event)
  if (!body?.content?.trim()) {
    throw createError({
      statusCode: 400,
      message: 'Le champ "content" est requis',
    })
  }

  const existing = await prisma.note.findUnique({ where: { id } })
  if (!existing)
    throw createError({ statusCode: 404, message: 'Note introuvable' })

  const note = await prisma.note.update({
    where: { id },
    data: { content: body.content.trim() },
    include: { cow: true, calf: true, bull: true },
  })

  return { success: true, data: note }
})
