    <script lang="ts" setup>
    import type { LocationWithBuildingsCount } from '~~/types';

    const props = defineProps<{
      locations: LocationWithBuildingsCount[]
    }>()

</script>
<template>
  <div>
    <div class="flex items-center gap-3 mb-8">
      <NuxtLink to="/" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
        <UIcon name="i-lucide-arrow-left" class="size-5" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold">Locations</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {{ locations.length }} location{{ locations.length !== 1 ? 's' : '' }}
        </p>
      </div>
    </div>
  </div>
</template>