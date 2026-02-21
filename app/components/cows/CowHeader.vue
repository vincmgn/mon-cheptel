<script lang="ts" setup>
import type { PenWithCows } from '~~/types'

defineProps<{
  pen: PenWithCows
}>()
</script>

<template>
  <div class="flex items-center gap-3 mb-8">
    <NuxtLink
      :to="`/buildings/${pen.building.id}`"
      class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
    >
      <UIcon name="i-lucide-arrow-left" class="size-5" />
    </NuxtLink>
    <div>
      <p class="text-xs text-gray-400 mb-0.5">
        <NuxtLink :to="`/locations/${pen.building.location.id}`" class="hover:underline">
          {{ pen.building.location.name }}
        </NuxtLink>
        ›
        <NuxtLink :to="`/buildings/${pen.building.id}`" class="hover:underline">
          {{ pen.building.name }}
        </NuxtLink>
      </p>
      <h1 class="text-2xl font-bold">{{ pen.name }}</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
        {{ pen.cows.length }} vache{{ pen.cows.length !== 1 ? 's' : '' }}
      </p>
    </div>
  </div>
</template>
