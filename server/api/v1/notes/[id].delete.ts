import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

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
    (existing.calf && existing.calf.cow.pen.building.location.userId === userId) ||
    (existing.bull && existing.bull.userId === userId)

  if (!isOwner)
    throw createError({ statusCode: 403, message: 'Accès interdit' })

  await prisma.note.delete({ where: { id } })

  return { success: true, message: 'Note supprimée' }
})
