import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const note = await prisma.note.findUnique({
    where: { id },
    include: { cow: true, calf: true, bull: true },
  })

  if (!note) throw createError({ statusCode: 404, message: 'Note introuvable' })

  return { success: true, data: note }
})
