import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const existing = await prisma.comment.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, message: 'Commentaire introuvable' })

  await prisma.comment.delete({ where: { id } })

  return { success: true, message: 'Commentaire supprimé' }
})
