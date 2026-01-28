import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@scalar/nuxt'],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  scalar: {
    pathRouting: {
      basePath: '/api',
    },
    theme: 'default',
  },
  nitro: {
    experimental: {
      openAPI: true,
    },
  },
})
