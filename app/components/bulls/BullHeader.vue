<script lang="ts" setup>
import type { BullWithCount } from '~~/types'

defineProps<{
  bulls: BullWithCount[]
}>()
</script>

<template>
  <div class="flex items-center gap-3 mb-8">
    <NuxtLink
      to="/"
      class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
    >
      <UIcon name="i-lucide-arrow-left" class="size-5" />
    </NuxtLink>
    <div>
      <h1 class="text-2xl font-bold">Taureaux</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
        {{ bulls.length }} taureau{{ bulls.length !== 1 ? 'x' : '' }}
      </p>
    </div>
  </div>
</template>
