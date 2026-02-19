import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const existing = await prisma.building.findUnique({
    where: { id },
    include: { pens: true },
  })
  if (!existing)
    throw createError({ statusCode: 404, message: 'Bâtiment introuvable' })

  if (existing.pens.length > 0)
    throw createError({
      statusCode: 409,
      message: `Impossible de supprimer ce bâtiment : il contient ${existing.pens.length} enclos/box. Supprimez-les d'abord.`,
    })

  await prisma.building.delete({ where: { id } })

  return { success: true, message: 'Bâtiment supprimé' }
})
