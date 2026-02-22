import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)

  const notes = await prisma.note.findMany({
    where: {
      OR: [
        { cow: { pen: { building: { location: { userId } } } } },
        { calf: { cow: { pen: { building: { location: { userId } } } } } },
        { bull: { userId } },
      ],
    },
    include: {
      cow: true,
      calf: true,
      bull: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return { success: true, data: notes }
})
