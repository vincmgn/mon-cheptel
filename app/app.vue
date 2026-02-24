<script setup lang="ts">
const toaster = { position: 'bottom-left' } as const

useHead({
  link: [
    { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
    { rel: 'icon', href: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon-180x180.png' },
  ],
})
</script>
<template>
  <UApp :toaster="toaster">
    <NuxtPage />
  </UApp>
</template>
