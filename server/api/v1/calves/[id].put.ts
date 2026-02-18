import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, message: 'ID invalide' })

  const body = await readBody(event)

  const existing = await prisma.calf.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, message: 'Veau introuvable' })

  if (body.sex && !['M', 'F'].includes(body.sex)) {
    throw createError({ statusCode: 400, message: 'Le champ "sex" doit être M ou F' })
  }

  const calf = await prisma.calf.update({
    where: { id },
    data: {
      ...(body.sex ? { sex: body.sex } : {}),
      ...(body.birthDate ? { birthDate: new Date(body.birthDate) } : {}),
    },
    include: { cow: true },
  })

  return { success: true, data: calf }
})
