<script setup lang="ts">
const toaster = { position: 'bottom-left' } as const
const {
  public: { appVersion },
} = useRuntimeConfig()
const showSplash = ref(true)

onMounted(() => {
  const splashStart = window.performance.now()

  const hideSplash = () => {
    const elapsed = window.performance.now() - splashStart
    const remaining = Math.max(450 - elapsed, 0)

    window.setTimeout(() => {
      showSplash.value = false
    }, remaining)
  }

  if (document.readyState === 'complete') {
    hideSplash()
    return
  }

  window.addEventListener('load', hideSplash, { once: true })
})

useHead({
  meta: [
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'black-translucent',
    },
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
    <Transition name="app-splash">
      <div
        v-if="showSplash"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-white/96 dark:bg-gray-950/96 backdrop-blur-sm"
      >
        <div class="app-splash-card text-center">
          <div
            class="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/12 text-6xl shadow-lg shadow-primary/10 ring-1 ring-primary/10 dark:bg-primary/20"
          >
            🐄
          </div>
          <p
            class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
          >
            Mon Cheptel
          </p>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Préparation de l'application
          </p>
          <p
            class="mt-3 text-xs font-medium uppercase tracking-[0.24em] text-gray-400 dark:text-gray-500"
          >
            v{{ appVersion }}
          </p>
        </div>
      </div>
    </Transition>
    <NuxtPage />
  </UApp>
</template>
