<script setup lang="ts">
import Hero from '~/components/index/Hero.vue'
import type { ApiList, ApiResponse, Stats } from '~~/types'

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

// Search
const searchQuery = ref('')
const searchResults = ref<{
  cows: Array<{
    id: number
    officialId: string
    pen: {
      building: {
        location: { id: number; name: string }
        id: number
        name: string
      }
      id: number
      name: string
    }
  }>
  bulls: Array<{ id: number; name: string }>
  locations: Array<{ id: number; name: string }>
  buildings: Array<{
    id: number
    name: string
    location: { id: number; name: string }
  }>
  pens: Array<{
    id: number
    name: string
    building: {
      id: number
      name: string
      location: { id: number; name: string }
    }
  }>
} | null>(null)
const isSearching = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, q => {
  if (searchTimer) clearTimeout(searchTimer)
  if (q.trim().length < 2) {
    searchResults.value = null
    return
  }
  searchTimer = setTimeout(async () => {
    isSearching.value = true
    try {
      const res = await $fetch<ApiResponse<typeof searchResults.value>>(
        `/api/v1/search?q=${encodeURIComponent(q.trim())}`
      )
      searchResults.value = res.data ?? null
    } finally {
      isSearching.value = false
    }
  }, 300)
})

const hasResults = computed(() => {
  if (!searchResults.value) return false
  const r = searchResults.value
  return (
    r.cows.length +
      r.bulls.length +
      r.locations.length +
      r.buildings.length +
      r.pens.length >
    0
  )
})

function clearSearch() {
  searchQuery.value = ''
  searchResults.value = null
}
</script>

<template>
  <UContainer class="py-16 max-w-2xl">
    <!-- Hero -->
    <Hero :stats="stats" />

    <!-- Search bar -->
    <div class="relative mb-10">
      <UInput
        v-model="searchQuery"
        placeholder="Rechercher une vache, un taureau, un lieu…"
        icon="i-lucide-search"
        size="lg"
        class="w-full"
        :loading="isSearching"
      >
        <template v-if="searchQuery" #trailing>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            size="sm"
            @click="clearSearch"
          />
        </template>
      </UInput>

      <!-- Search results dropdown -->
      <div
        v-if="searchQuery.length >= 2"
        class="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden"
      >
        <div v-if="isSearching" class="p-4 text-center text-gray-400 text-sm">
          <UIcon
            name="i-lucide-loader-circle"
            class="size-4 animate-spin inline mr-2"
          />
          Recherche…
        </div>
        <div
          v-else-if="!hasResults"
          class="p-4 text-center text-gray-400 text-sm"
        >
          Aucun résultat pour « {{ searchQuery }} »
        </div>
        <div
          v-else
          class="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto"
        >
          <!-- Vaches -->
          <template v-if="searchResults?.cows.length">
            <div class="px-3 pt-2 pb-1">
              <span
                class="text-xs font-semibold text-gray-400 uppercase tracking-wide"
                >Vaches</span
              >
            </div>
            <NuxtLink
              v-for="cow in searchResults.cows"
              :key="'cow-' + cow.id"
              :to="`/cows/${cow.id}`"
              class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              @click="clearSearch"
            >
              <UIcon
                name="i-lucide-beef"
                class="size-4 text-orange-500 shrink-0"
              />
              <div class="min-w-0">
                <p class="font-medium text-sm">🐄 {{ cow.officialId }}</p>
                <p class="text-xs text-gray-400 truncate">
                  {{ cow.pen.building.location.name }} ›
                  {{ cow.pen.building.name }} › {{ cow.pen.name }}
                </p>
              </div>
            </NuxtLink>
          </template>

          <!-- Taureaux -->
          <template v-if="searchResults?.bulls.length">
            <div class="px-3 pt-2 pb-1">
              <span
                class="text-xs font-semibold text-gray-400 uppercase tracking-wide"
                >Taureaux</span
              >
            </div>
            <NuxtLink
              v-for="bull in searchResults.bulls"
              :key="'bull-' + bull.id"
              :to="`/bulls/${bull.id}`"
              class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              @click="clearSearch"
            >
              <UIcon
                name="i-lucide-shield"
                class="size-4 text-rose-500 shrink-0"
              />
              <p class="font-medium text-sm">🐂 {{ bull.name }}</p>
            </NuxtLink>
          </template>

          <!-- Lieux -->
          <template v-if="searchResults?.locations.length">
            <div class="px-3 pt-2 pb-1">
              <span
                class="text-xs font-semibold text-gray-400 uppercase tracking-wide"
                >Lieux</span
              >
            </div>
            <NuxtLink
              v-for="loc in searchResults.locations"
              :key="'loc-' + loc.id"
              :to="`/locations/${loc.id}`"
              class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              @click="clearSearch"
            >
              <UIcon
                name="i-lucide-map-pin"
                class="size-4 text-primary shrink-0"
              />
              <p class="font-medium text-sm">{{ loc.name }}</p>
            </NuxtLink>
          </template>

          <!-- Bâtiments -->
          <template v-if="searchResults?.buildings.length">
            <div class="px-3 pt-2 pb-1">
              <span
                class="text-xs font-semibold text-gray-400 uppercase tracking-wide"
                >Bâtiments</span
              >
            </div>
            <NuxtLink
              v-for="building in searchResults.buildings"
              :key="'building-' + building.id"
              :to="`/buildings/${building.id}`"
              class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              @click="clearSearch"
            >
              <UIcon
                name="i-lucide-building-2"
                class="size-4 text-amber-500 shrink-0"
              />
              <div class="min-w-0">
                <p class="font-medium text-sm">{{ building.name }}</p>
                <p class="text-xs text-gray-400">
                  {{ building.location.name }}
                </p>
              </div>
            </NuxtLink>
          </template>

          <!-- Cases -->
          <template v-if="searchResults?.pens.length">
            <div class="px-3 pt-2 pb-1">
              <span
                class="text-xs font-semibold text-gray-400 uppercase tracking-wide"
                >Cases</span
              >
            </div>
            <NuxtLink
              v-for="pen in searchResults.pens"
              :key="'pen-' + pen.id"
              :to="`/pens/${pen.id}`"
              class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              @click="clearSearch"
            >
              <UIcon
                name="i-lucide-layout-grid"
                class="size-4 text-green-500 shrink-0"
              />
              <div class="min-w-0">
                <p class="font-medium text-sm">{{ pen.name }}</p>
                <p class="text-xs text-gray-400">
                  {{ pen.building.location.name }} › {{ pen.building.name }}
                </p>
              </div>
            </NuxtLink>
          </template>
        </div>
      </div>
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
