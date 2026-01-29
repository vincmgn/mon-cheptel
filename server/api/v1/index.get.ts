import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return {
      ok: true,
      db: 'up',
      version: 'v1',
      endpoints: {
        // docs: '/api/docs',
      },
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      ok: false,
      db: 'error',
      message: error instanceof Error ? error.message : 'Erreur DB',
      endpoints: {
        // docs: '/api/docs',
      },
      timestamp: new Date().toISOString(),
    }
  }
})
