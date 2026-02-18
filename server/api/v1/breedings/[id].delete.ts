import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const existing = await prisma.breeding.findUnique({ where: { id } })
  if (!existing)
    throw createError({ statusCode: 404, message: 'Saillie introuvable' })

  await prisma.breeding.delete({ where: { id } })

  return { success: true, message: 'Saillie supprimée' }
})
