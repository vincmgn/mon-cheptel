export default defineEventHandler(() => {
  return {
    ok: true,
    versions: {
      v1: '/api/v1',
    },
    timestamp: new Date().toISOString(),
  }
})
})
