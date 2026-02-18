import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async () => {
  const comments = await prisma.comment.findMany({
    include: {
      cow: true,
      calf: true,
      bull: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return { success: true, data: comments }
})
