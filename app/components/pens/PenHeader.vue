<script lang="ts" setup>
import type { BuildingWithPens } from '~~/types'

defineProps<{
  building: BuildingWithPens
}>()
</script>

<template>
  <div class="flex items-center gap-3 mb-8">
    <NuxtLink
      :to="`/locations/${building.location.id}`"
      class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
    >
      <UIcon name="i-lucide-arrow-left" class="size-5" />
    </NuxtLink>
    <div>
      <p class="text-xs text-gray-400 mb-0.5">
        <NuxtLink
          :to="`/locations/${building.location.id}`"
          class="hover:underline"
        >
          {{ building.location.name }}
        </NuxtLink>
      </p>
      <h1 class="text-2xl font-bold">{{ building.name }}</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
        {{ building.pens.length }} case{{
          building.pens.length !== 1 ? 's' : ''
        }}
      </p>
    </div>
  </div>
</template>
