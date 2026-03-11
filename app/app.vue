<script setup lang="ts">
const toaster = { position: 'bottom-left' } as const

useHead({
  meta: [
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'apple-mobile-web-app-title', content: 'Cheptel' },
    { name: 'mobile-web-app-capable', content: 'yes' },
  ],
  titleTemplate: title => (title ? `${title} — Mon Cheptel` : 'Mon Cheptel'),
  link: [
    { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
    { rel: 'icon', href: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon-180x180.png' },
  ],
})
</script>
<template>
  <VitePwaManifest />
  <UApp :toaster="toaster">
    <NuxtPage />
  </UApp>
</template>
