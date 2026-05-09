<script lang="ts" setup>
import type { LocationWithBuildingsDetail } from '~~/types'

const props = defineProps<{
  location: LocationWithBuildingsDetail
}>()

const buildingCount = computed(
  () => props.location.buildings.filter(b => b.type !== 'meadow').length
)
const meadowCount = computed(
  () => props.location.buildings.filter(b => b.type === 'meadow').length
)

const subtitle = computed(() => {
  const parts: string[] = []
  if (buildingCount.value)
    parts.push(
      `${buildingCount.value} bâtiment${buildingCount.value !== 1 ? 's' : ''}`
    )
  if (meadowCount.value)
    parts.push(`${meadowCount.value} pré${meadowCount.value !== 1 ? 's' : ''}`)
  return parts.join(' · ') || 'Aucune structure'
})
</script>

<template>
  <div class="flex items-center gap-3 mb-8">
    <NuxtLink
      to="/locations"
      class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
    >
      <UIcon name="i-lucide-arrow-left" class="size-5" />
    </NuxtLink>
    <div>
      <h1 class="text-2xl font-bold">{{ location.name }}</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>
