<script setup lang="ts">
import Hero from '~/components/index/Hero.vue'
import SearchBar from '~/components/shared/SearchBar.vue'
import type { ApiList } from '~~/types'

const { user, clear } = useUserSession()

const { data: statsData } = await useAsyncData('dashboard-stats', () =>
  Promise.all([
    $fetch<ApiList>('/api/v1/cows'),
    $fetch<ApiList>('/api/v1/calves'),
    $fetch<ApiList>('/api/v1/bulls'),
  ])
)

const stats = computed(() => {
  if (!statsData.value) return { cows: 0, calves: 0, bulls: 0 }
  const [cows, calves, bulls] = statsData.value
  return {
    cows: cows.data.length,
    calves: calves.data.length,
    bulls: bulls.data.length,
  }
})

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/login')
}
</script>

<template>
  <UContainer class="py-16 max-w-2xl">
    <!-- Header with farm name + logout -->
    <div class="flex items-center justify-between mb-10">
      <div>
        <p
          class="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5"
        >
          Exploitation
        </p>
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {{ user?.farmName }}
        </h2>
      </div>
      <UDropdownMenu
        :items="[
          [{ label: 'Mon compte', icon: 'i-lucide-settings', to: '/account' }],
          [{ label: 'Déconnexion', icon: 'i-lucide-log-out', color: 'error', onSelect: logout }],
        ]"
      >
        <UButton
          icon="i-lucide-user"
          color="neutral"
          variant="ghost"
          size="sm"
        />
      </UDropdownMenu>
    </div>

    <!-- Hero -->
    <Hero :stats="stats" />

    <!-- Search bar -->
    <div class="mb-10">
      <SearchBar />
    </div>

    <!-- Main entry cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <NuxtLink to="/locations" class="group">
        <UCard
          class="h-full transition-all group-hover:shadow-md cursor-pointer"
        >
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-xl bg-primary/10 dark:bg-primary/20">
              <UIcon name="i-lucide-map-pin" class="size-8 text-primary" />
            </div>
            <div>
              <h2 class="text-lg font-bold">Mes Lieux</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Lieux → Bâtiments → Cases → Vaches
              </p>
            </div>
          </div>
          <div class="mt-4">
            <UBadge color="primary" variant="subtle">Parcourir →</UBadge>
          </div>
        </UCard>
      </NuxtLink>

      <NuxtLink to="/bulls" class="group">
        <UCard
          class="h-full transition-all group-hover:shadow-md cursor-pointer"
        >
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-xl bg-rose-500/10 dark:bg-rose-500/20">
              <UIcon name="i-lucide-shield" class="size-8 text-rose-500" />
            </div>
            <div>
              <h2 class="text-lg font-bold">Mes Taureaux</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Gérer vos reproducteurs mâles
              </p>
            </div>
          </div>
          <div class="mt-4">
            <UBadge color="neutral" variant="subtle">Voir la liste →</UBadge>
          </div>
        </UCard>
      </NuxtLink>
    </div>
  </UContainer>
</template>
