import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', 'nuxt-auth-utils', '@vite-pwa/nuxt'],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  nitro: {
    experimental: {
      openAPI: true,
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Mon Cheptel',
      short_name: 'Cheptel',
      description: 'Application de gestion de votre cheptel',
      theme_color: '#22c55e',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
        { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: 'maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      navigateFallback: null,
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      runtimeCaching: [
        {
          // NetworkFirst pour les appels API — données lisibles offline
          urlPattern: ({ url }: { url: URL }) =>
            url.pathname.startsWith('/api/'),
          handler: 'NetworkFirst' as const,
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24, // 24h
            },
            networkTimeoutSeconds: 10,
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
    devOptions: {
      enabled: false,
    },
  },
})
