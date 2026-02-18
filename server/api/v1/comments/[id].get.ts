import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const comment = await prisma.comment.findUnique({
    where: { id },
    include: { cow: true, calf: true, bull: true },
  })

  if (!comment) throw createError({ statusCode: 404, message: 'Commentaire introuvable' })

  return { success: true, data: comment }
})
