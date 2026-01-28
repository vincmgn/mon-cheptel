import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return {
      ok: true,
      db: 'up',
      version: 'v1',
      endpoints: {
        bulls: {
          list: 'GET /api/v1/bulls',
          create: 'POST /api/v1/bulls',
        },
      },
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      ok: false,
      db: 'error',
      message: error instanceof Error ? error.message : 'Erreur DB',
      endpoints: {
        bulls: {
          list: 'GET /api/v1/bulls',
          create: 'POST /api/v1/bulls',
        },
      },
      timestamp: new Date().toISOString(),
    }
  }
})
