export default defineEventHandler(() => {
  return {
    ok: true,
    versions: {
      v1: '/api/v1',
      docs: '/api/docs',
    },
    timestamp: new Date().toISOString(),
  }
})
