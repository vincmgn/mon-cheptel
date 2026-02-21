import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return {
      ok: true,
      db: 'up',
      version: 'v1',
      endpoints: {
        locations: '/api/v1/locations',
        buildings: '/api/v1/buildings',
        pens: '/api/v1/pens',
        cows: '/api/v1/cows',
        calves: '/api/v1/calves',
        bulls: '/api/v1/bulls',
        breedings: '/api/v1/breedings',
        notes: '/api/v1/notes',
      },
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      ok: false,
      db: 'error',
      message: error instanceof Error ? error.message : 'Erreur DB',
      endpoints: {},
      timestamp: new Date().toISOString(),
    }
  }
})
