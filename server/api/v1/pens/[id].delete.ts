import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const existing = await prisma.pen.findUnique({ where: { id } })
  if (!existing)
    throw createError({ statusCode: 404, message: 'Box/Enclos introuvable' })

  await prisma.pen.delete({ where: { id } })

  return { success: true, message: 'Box/Enclos supprimé' }
})
