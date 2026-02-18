import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const breeding = await prisma.breeding.findUnique({
    where: { id },
    include: {
      cow: { include: { pen: { include: { building: { include: { location: true } } } } } },
      bull: true,
    },
  })

  if (!breeding) throw createError({ statusCode: 404, message: 'Saillie introuvable' })

  return { success: true, data: breeding }
})
