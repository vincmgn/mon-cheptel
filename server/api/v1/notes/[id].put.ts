import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const body = await readBody(event)
  if (!body?.content?.trim()) {
    throw createError({
      statusCode: 400,
      message: 'Le champ "content" est requis',
    })
  }

  const existing = await prisma.note.findUnique({
    where: { id },
    include: {
      cow: {
        include: {
          pen: { include: { building: { include: { location: true } } } },
        },
      },
      calf: {
        include: {
          cow: {
            include: {
              pen: { include: { building: { include: { location: true } } } },
            },
          },
        },
      },
      bull: true,
    },
  })
  if (!existing)
    throw createError({ statusCode: 404, message: 'Note introuvable' })

  const isOwner =
    (existing.cow && existing.cow.pen.building.location.userId === userId) ||
    (existing.calf &&
      existing.calf.cow.pen.building.location.userId === userId) ||
    (existing.bull && existing.bull.userId === userId)

  if (!isOwner)
    throw createError({ statusCode: 403, message: 'Accès interdit' })

  const note = await prisma.note.update({
    where: { id },
    data: { content: body.content.trim() },
    include: { cow: true, calf: true, bull: true },
  })

  return { success: true, data: note }
})
