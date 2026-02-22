import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)
  const body = await readBody(event)

  if (!body?.sex || !['M', 'F'].includes(body.sex)) {
    throw createError({
      statusCode: 400,
      message: 'Le champ "sex" est requis (M ou F)',
    })
  }
  if (!body?.cowId) {
    throw createError({
      statusCode: 400,
      message: 'Le champ "cowId" est requis',
    })
  }

  const cowExists = await prisma.cow.findUnique({
    where: { id: body.cowId },
    include: { pen: { include: { building: { include: { location: true } } } } },
  })
  if (!cowExists)
    throw createError({ statusCode: 404, message: 'Vache introuvable' })

  if (cowExists.pen.building.location.userId !== userId)
    throw createError({ statusCode: 403, message: 'Accès interdit' })

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
