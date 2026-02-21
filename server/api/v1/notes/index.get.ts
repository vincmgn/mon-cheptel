import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async () => {
  const notes = await prisma.note.findMany({
    include: {
      cow: true,
      calf: true,
      bull: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return { success: true, data: notes }
})
