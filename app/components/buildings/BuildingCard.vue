<script lang="ts" setup>
import type { Building } from '~~/types'

defineProps<{
  building: Building & {
    pens: Array<{ id: number; name: string; buildingId: number; _count: { cows: number } }>
  }
}>()
</script>

<template>
  <div>
    <div class="mt-4 flex-1">
      <p class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
        {{ building.pens.length }} case{{ building.pens.length !== 1 ? 's' : '' }}
      </p>
      <ul v-if="building.pens.length" class="space-y-1.5">
        <li
          v-for="pen in building.pens"
          :key="pen.id"
          class="flex items-center justify-between text-sm"
        >
          <span class="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
            <UIcon name="i-lucide-layout-grid" class="size-4 text-gray-400 shrink-0" />
            {{ pen.name }}
          </span>
          <UBadge color="neutral" variant="subtle" size="md">
            {{ pen._count.cows }} vaches
          </UBadge>
        </li>
      </ul>
      <p v-else class="text-sm text-gray-400 dark:text-gray-500 italic">Aucune case</p>
    </div>
    <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
      <NuxtLink :to="`/buildings/${building.id}`">
        <UBadge color="primary" variant="subtle" class="cursor-pointer">
          Voir les cases →
        </UBadge>
      </NuxtLink>
    </div>
  </div>
</template>
