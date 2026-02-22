import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const note = await prisma.note.findUnique({
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

  if (!note) throw createError({ statusCode: 404, message: 'Note introuvable' })

  const isOwner =
    (note.cow && note.cow.pen.building.location.userId === userId) ||
    (note.calf && note.calf.cow.pen.building.location.userId === userId) ||
    (note.bull && note.bull.userId === userId)

  if (!isOwner)
    throw createError({ statusCode: 403, message: 'Accès interdit' })

  return { success: true, data: note }
})
