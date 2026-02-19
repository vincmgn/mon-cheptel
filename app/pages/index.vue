<script setup lang="ts">
interface ApiList<T> {
  success: boolean
  data: T[]
}

interface LocationWithBuildings {
  id: number
  buildings: { id: number }[]
}

const { data, status } = await useAsyncData('dashboard', () =>
  Promise.all([
    $fetch<ApiList<LocationWithBuildings>>('/api/v1/locations'),
    $fetch<ApiList<unknown>>('/api/v1/cows'),
    $fetch<ApiList<unknown>>('/api/v1/calves'),
    $fetch<ApiList<unknown>>('/api/v1/bulls'),
    $fetch<ApiList<unknown>>('/api/v1/pens'),
    $fetch<ApiList<unknown>>('/api/v1/breedings'),
    $fetch<ApiList<unknown>>('/api/v1/notes'),
  ])
)

const counts = computed(() => {
  if (!data.value)
    return {
      locations: 0,
      buildings: 0,
      pens: 0,
      cows: 0,
      calves: 0,
      bulls: 0,
      breedings: 0,
      notes: 0,
    }
  const [locations, cows, calves, bulls, pens, breedings, notes] = data.value
  return {
    locations: locations.data.length,
    buildings: locations.data.reduce((acc, l) => acc + l.buildings.length, 0),
    pens: pens.data.length,
    cows: cows.data.length,
    calves: calves.data.length,
    bulls: bulls.data.length,
    breedings: breedings.data.length,
    notes: notes.data.length,
  }
})

const loading = computed(() => status.value === 'pending')
</script>

<template>
  <UContainer class="py-10 max-w-5xl">
    <div class="mb-10">
      <h1 class="text-3xl font-bold">Mon Cheptel</h1>
      <p class="text-gray-500 dark:text-gray-400 mt-1">
        Vue d'ensemble de votre élevage
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Locations -->
      <NuxtLink to="/locations" class="group">
        <UCard
          class="h-full transition-shadow group-hover:shadow-md cursor-pointer"
        >
          <div class="flex items-start justify-between">
            <div>
              <div
                v-if="loading"
                class="h-9 w-16 rounded animate-pulse bg-gray-200 dark:bg-gray-700 mb-2"
              />
              <p v-else class="text-4xl font-bold">{{ counts.locations }}</p>
              <h3 class="text-base font-semibold mt-1">Locations</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Emplacements géographiques
              </p>
            </div>
            <div class="p-2.5 rounded-xl bg-primary/10 dark:bg-primary/20">
              <UIcon name="i-lucide-map-pin" class="size-6 text-primary" />
            </div>
          </div>
          <div class="mt-4">
            <UBadge color="primary" variant="subtle" size="lg">Gérer →</UBadge>
          </div>
        </UCard>
      </NuxtLink>

      <!-- Bâtiments -->
      <UCard class="h-full">
        <div class="flex items-start justify-between">
          <div>
            <div
              v-if="loading"
              class="h-9 w-16 rounded animate-pulse bg-gray-200 dark:bg-gray-700 mb-2"
            />
            <p v-else class="text-4xl font-bold">{{ counts.buildings }}</p>
            <h3 class="text-base font-semibold mt-1">Bâtiments</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Structures et installations
            </p>
          </div>
          <div class="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/20">
            <UIcon name="i-lucide-building-2" class="size-6 text-amber-500" />
          </div>
        </div>
        <div class="mt-4">
          <UBadge color="neutral" variant="subtle" size="lg">Bientôt</UBadge>
        </div>
      </UCard>

      <!-- Enclos -->
      <UCard class="h-full">
        <div class="flex items-start justify-between">
          <div>
            <div
              v-if="loading"
              class="h-9 w-16 rounded animate-pulse bg-gray-200 dark:bg-gray-700 mb-2"
            />
            <p v-else class="text-4xl font-bold">{{ counts.pens }}</p>
            <h3 class="text-base font-semibold mt-1">Enclos / Box</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Espaces d'hébergement
            </p>
          </div>
          <div class="p-2.5 rounded-xl bg-green-500/10 dark:bg-green-500/20">
            <UIcon name="i-lucide-layout-grid" class="size-6 text-green-500" />
          </div>
        </div>
        <div class="mt-4">
          <UBadge color="neutral" variant="subtle" size="lg">Bientôt</UBadge>
        </div>
      </UCard>

      <!-- Vaches — large card -->
      <UCard class="col-span-1 lg:col-span-2 h-full">
        <div class="flex items-start justify-between">
          <div>
            <div
              v-if="loading"
              class="h-9 w-16 rounded animate-pulse bg-gray-200 dark:bg-gray-700 mb-2"
            />
            <p v-else class="text-4xl font-bold">{{ counts.cows }}</p>
            <h3 class="text-base font-semibold mt-1">Vaches</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Femelles reproductrices
            </p>
          </div>
          <div class="p-2.5 rounded-xl bg-orange-500/10 dark:bg-orange-500/20">
            <UIcon name="i-lucide-beef" class="size-6 text-orange-500" />
          </div>
        </div>
        <div class="mt-4">
          <UBadge color="neutral" variant="subtle" size="lg">Bientôt</UBadge>
        </div>
      </UCard>

      <!-- Taureaux -->
      <UCard class="h-full">
        <div class="flex items-start justify-between">
          <div>
            <div
              v-if="loading"
              class="h-9 w-16 rounded animate-pulse bg-gray-200 dark:bg-gray-700 mb-2"
            />
            <p v-else class="text-4xl font-bold">{{ counts.bulls }}</p>
            <h3 class="text-base font-semibold mt-1">Taureaux</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Mâles reproducteurs
            </p>
          </div>
          <div class="p-2.5 rounded-xl bg-rose-500/10 dark:bg-rose-500/20">
            <UIcon name="i-lucide-shield" class="size-6 text-rose-500" />
          </div>
        </div>
        <div class="mt-4">
          <UBadge color="neutral" variant="subtle" size="lg">Bientôt</UBadge>
        </div>
      </UCard>

      <!-- Veaux -->
      <UCard class="h-full">
        <div class="flex items-start justify-between">
          <div>
            <div
              v-if="loading"
              class="h-9 w-16 rounded animate-pulse bg-gray-200 dark:bg-gray-700 mb-2"
            />
            <p v-else class="text-4xl font-bold">{{ counts.calves }}</p>
            <h3 class="text-base font-semibold mt-1">Veaux</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Nouveau-nés du troupeau
            </p>
          </div>
          <div class="p-2.5 rounded-xl bg-violet-500/10 dark:bg-violet-500/20">
            <UIcon name="i-lucide-baby" class="size-6 text-violet-500" />
          </div>
        </div>
        <div class="mt-4">
          <UBadge color="neutral" variant="subtle" size="lg">Bientôt</UBadge>
        </div>
      </UCard>

      <!-- Saillies -->
      <UCard class="h-full">
        <div class="flex items-start justify-between">
          <div>
            <div
              v-if="loading"
              class="h-9 w-16 rounded animate-pulse bg-gray-200 dark:bg-gray-700 mb-2"
            />
            <p v-else class="text-4xl font-bold">{{ counts.breedings }}</p>
            <h3 class="text-base font-semibold mt-1">Saillies</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Reproductions enregistrées
            </p>
          </div>
          <div class="p-2.5 rounded-xl bg-pink-500/10 dark:bg-pink-500/20">
            <UIcon name="i-lucide-heart" class="size-6 text-pink-500" />
          </div>
        </div>
        <div class="mt-4">
          <UBadge color="neutral" variant="subtle" size="lg">Bientôt</UBadge>
        </div>
      </UCard>

      <!-- Notes -->
      <UCard class="h-full">
        <div class="flex items-start justify-between">
          <div>
            <div
              v-if="loading"
              class="h-9 w-16 rounded animate-pulse bg-gray-200 dark:bg-gray-700 mb-2"
            />
            <p v-else class="text-4xl font-bold">{{ counts.notes }}</p>
            <h3 class="text-base font-semibold mt-1">Notes</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Observations et remarques
            </p>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-500/10 dark:bg-slate-500/20">
            <UIcon name="i-lucide-sticky-note" class="size-6 text-slate-500" />
          </div>
        </div>
        <div class="mt-4">
          <UBadge color="neutral" variant="subtle" size="lg">Bientôt</UBadge>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
