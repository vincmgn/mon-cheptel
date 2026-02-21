<script lang="ts" setup>
import type { ApiResponse } from '~~/types'

type SearchResults = {
  cows: Array<{ id: number; officialId: string; pen: { id: number; name: string; building: { id: number; name: string; location: { id: number; name: string } } } }>
  bulls: Array<{ id: number; name: string }>
  locations: Array<{ id: number; name: string }>
  buildings: Array<{ id: number; name: string; location: { id: number; name: string } }>
  pens: Array<{ id: number; name: string; building: { id: number; name: string; location: { id: number; name: string } } }>
}

const query = ref('')
const results = ref<SearchResults | null>(null)
const isSearching = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

watch(query, q => {
  if (timer) clearTimeout(timer)
  if (q.trim().length < 2) {
    results.value = null
    return
  }
  timer = setTimeout(async () => {
    isSearching.value = true
    try {
      const res = await $fetch<ApiResponse<SearchResults>>(`/api/v1/search?q=${encodeURIComponent(q.trim())}`)
      results.value = res.data ?? null
    } finally {
      isSearching.value = false
    }
  }, 300)
})

const hasResults = computed(() => {
  if (!results.value) return false
  const r = results.value
  return r.cows.length + r.bulls.length + r.locations.length + r.buildings.length + r.pens.length > 0
})

function clear() {
  query.value = ''
  results.value = null
}
</script>

<template>
  <div class="relative">
    <UInput
      v-model="query"
      placeholder="Rechercher une vache, un taureau, un lieu…"
      icon="i-lucide-search"
      size="lg"
      class="w-full"
      :loading="isSearching"
    >
      <template v-if="query" #trailing>
        <UButton color="neutral" variant="ghost" icon="i-lucide-x" size="sm" @click="clear" />
      </template>
    </UInput>

    <!-- Dropdown résultats -->
    <div
      v-if="query.length >= 2"
      class="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden"
    >
      <div v-if="isSearching" class="p-4 text-center text-gray-400 text-sm">
        <UIcon name="i-lucide-loader-circle" class="size-4 animate-spin inline mr-2" />
        Recherche…
      </div>
      <div v-else-if="!hasResults" class="p-4 text-center text-gray-400 text-sm">
        Aucun résultat pour « {{ query }} »
      </div>
      <div v-else class="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto">

        <!-- Vaches -->
        <template v-if="results?.cows.length">
          <div class="px-3 pt-2 pb-1">
            <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Vaches</span>
          </div>
          <NuxtLink
            v-for="cow in results.cows"
            :key="'cow-' + cow.id"
            :to="`/cows/${cow.id}`"
            class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            @click="clear"
          >
            <UIcon name="i-lucide-beef" class="size-4 text-orange-500 shrink-0" />
            <div class="min-w-0">
              <p class="font-medium text-sm">🐄 {{ cow.officialId }}</p>
              <p class="text-xs text-gray-400 truncate">
                {{ cow.pen.building.location.name }} › {{ cow.pen.building.name }} › {{ cow.pen.name }}
              </p>
            </div>
          </NuxtLink>
        </template>

        <!-- Taureaux -->
        <template v-if="results?.bulls.length">
          <div class="px-3 pt-2 pb-1">
            <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Taureaux</span>
          </div>
          <NuxtLink
            v-for="bull in results.bulls"
            :key="'bull-' + bull.id"
            :to="`/bulls/${bull.id}`"
            class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            @click="clear"
          >
            <UIcon name="i-lucide-shield" class="size-4 text-rose-500 shrink-0" />
            <p class="font-medium text-sm">🐂 {{ bull.name }}</p>
          </NuxtLink>
        </template>

        <!-- Lieux -->
        <template v-if="results?.locations.length">
          <div class="px-3 pt-2 pb-1">
            <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Lieux</span>
          </div>
          <NuxtLink
            v-for="loc in results.locations"
            :key="'loc-' + loc.id"
            :to="`/locations/${loc.id}`"
            class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            @click="clear"
          >
            <UIcon name="i-lucide-map-pin" class="size-4 text-primary shrink-0" />
            <p class="font-medium text-sm">{{ loc.name }}</p>
          </NuxtLink>
        </template>

        <!-- Bâtiments -->
        <template v-if="results?.buildings.length">
          <div class="px-3 pt-2 pb-1">
            <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Bâtiments</span>
          </div>
          <NuxtLink
            v-for="building in results.buildings"
            :key="'building-' + building.id"
            :to="`/buildings/${building.id}`"
            class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            @click="clear"
          >
            <UIcon name="i-lucide-building-2" class="size-4 text-amber-500 shrink-0" />
            <div class="min-w-0">
              <p class="font-medium text-sm">{{ building.name }}</p>
              <p class="text-xs text-gray-400">{{ building.location.name }}</p>
            </div>
          </NuxtLink>
        </template>

        <!-- Cases -->
        <template v-if="results?.pens.length">
          <div class="px-3 pt-2 pb-1">
            <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Cases</span>
          </div>
          <NuxtLink
            v-for="pen in results.pens"
            :key="'pen-' + pen.id"
            :to="`/pens/${pen.id}`"
            class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            @click="clear"
          >
            <UIcon name="i-lucide-layout-grid" class="size-4 text-green-500 shrink-0" />
            <div class="min-w-0">
              <p class="font-medium text-sm">{{ pen.name }}</p>
              <p class="text-xs text-gray-400">{{ pen.building.location.name }} › {{ pen.building.name }}</p>
            </div>
          </NuxtLink>
        </template>

      </div>
    </div>
  </div>
</template>
