import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const existing = await prisma.building.findUnique({ where: { id } })
  if (!existing)
    throw createError({ statusCode: 404, message: 'Bâtiment introuvable' })

  await prisma.building.delete({ where: { id } })

  return { success: true, message: 'Bâtiment supprimé' }
})
