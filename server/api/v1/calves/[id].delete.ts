import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const existing = await prisma.calf.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, message: 'Veau introuvable' })

  await prisma.calf.delete({ where: { id } })

  return { success: true, message: 'Veau supprimé' }
})
