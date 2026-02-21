<script lang="ts" setup>
import type { Stats } from '~~/types'

const props = defineProps<{
  stats: Stats
}>()
</script>

<template>
  <div>
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold mb-2">Mon Cheptel</h1>
      <p class="text-gray-500 dark:text-gray-400">
        {{ props.stats.cows }} vaches · {{ props.stats.calves }} veaux ·
        {{ props.stats.bulls }} taureaux
      </p>
    </div>
  </div>
</template>
