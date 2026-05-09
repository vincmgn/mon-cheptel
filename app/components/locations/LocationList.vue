<script lang="ts" setup>
import type { LocationWithBuildingsCount } from '~~/types'

const props = defineProps<{
  location: LocationWithBuildingsCount
}>()

const buildings = computed(() =>
  props.location.buildings.filter(b => b.type !== 'meadow')
)
const meadows = computed(() =>
  props.location.buildings.filter(b => b.type === 'meadow')
)

const subtitle = computed(() => {
  const parts: string[] = []
  if (buildings.value.length)
    parts.push(
      `${buildings.value.length} bâtiment${buildings.value.length !== 1 ? 's' : ''}`
    )
  if (meadows.value.length)
    parts.push(
      `${meadows.value.length} pré${meadows.value.length !== 1 ? 's' : ''}`
    )
  return parts.join(' · ') || '0 bâtiment'
})
</script>

<template>
  <div>
    <div class="mt-4 flex-1">
      <p
        class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2"
      >
        {{ subtitle }}
      </p>
      <ul v-if="props.location.buildings.length" class="space-y-1.5">
        <li
          v-for="building in props.location.buildings"
          :key="building.id"
          class="flex items-center justify-between text-sm"
        >
          <span
            class="flex items-center gap-1.5 text-gray-700 dark:text-gray-300"
          >
            <UIcon
              :name="
                building.type === 'meadow'
                  ? 'i-lucide-trees'
                  : 'i-lucide-building-2'
              "
              class="size-4 shrink-0"
              :class="
                building.type === 'meadow' ? 'text-green-500' : 'text-gray-400'
              "
            />
            {{ building.name }}
          </span>
          <UBadge
            v-if="building.type !== 'meadow'"
            color="neutral"
            variant="subtle"
            size="md"
          >
            {{ building._count.pens }} case{{
              building._count.pens !== 1 ? 's' : ''
            }}
          </UBadge>
        </li>
      </ul>
      <p v-else class="text-sm text-gray-400 dark:text-gray-500 italic">
        Aucun bâtiment associé
      </p>
    </div>
    <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
      <NuxtLink :to="`/locations/${props.location.id}`">
        <UBadge color="primary" variant="subtle" class="cursor-pointer">
          Voir les structures →
        </UBadge>
      </NuxtLink>
    </div>
  </div>
</template>
