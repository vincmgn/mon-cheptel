import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async event => {
  const body = await readBody(event)

  if (!body?.sex || !['M', 'F'].includes(body.sex)) {
    throw createError({ statusCode: 400, message: 'Le champ "sex" est requis (M ou F)' })
  }
  if (!body?.cowId) {
    throw createError({ statusCode: 400, message: 'Le champ "cowId" est requis' })
  }

  const cowExists = await prisma.cow.findUnique({ where: { id: body.cowId } })
  if (!cowExists) throw createError({ statusCode: 404, message: 'Vache introuvable' })

  const calf = await prisma.calf.create({
    data: {
      sex: body.sex,
      birthDate: body.birthDate ? new Date(body.birthDate) : new Date(),
      cowId: body.cowId,
    },
    include: { cow: true },
  })

  setResponseStatus(event, 201)
  return { success: true, data: calf }
})
