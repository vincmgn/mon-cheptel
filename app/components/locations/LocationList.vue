<script lang="ts" setup>
import type { LocationWithBuildingsCount } from '~~/types'

const props = defineProps<{
  location: LocationWithBuildingsCount
}>()
</script>

<template>
  <div>
    <div class="mt-4 flex-1">
      <p
        class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2"
      >
        {{ props.location.buildings.length }}
        {{ props.location.buildings.length !== 1 ? 'bâtiments' : 'bâtiment' }}
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
              name="i-lucide-building-2"
              class="size-4 text-gray-400 shrink-0"
            />
            {{ building.name }}
          </span>
          <UBadge color="neutral" variant="subtle" size="md">
            {{ building._count.pens }} enclos
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
          Voir les bâtiments →
        </UBadge>
      </NuxtLink>
    </div>
  </div>
</template>
