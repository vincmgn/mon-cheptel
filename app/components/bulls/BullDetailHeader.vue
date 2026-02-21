<script lang="ts" setup>
import type { BullDetail } from '~~/types'

defineProps<{
  bull: BullDetail
}>()

defineEmits<{
  (e: 'edit'): void
}>()
</script>

<template>
  <div class="flex items-center gap-3 mb-8">
    <NuxtLink
      to="/bulls"
      class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
    >
      <UIcon name="i-lucide-arrow-left" class="size-5" />
    </NuxtLink>
    <div class="flex-1">
      <p class="text-xs text-gray-400 mb-0.5">Taureaux</p>
      <div class="flex items-center gap-2">
        <h1 class="text-2xl font-bold">🐂 {{ bull.name }}</h1>
        <UButton icon="i-lucide-pencil" color="neutral" variant="ghost" size="sm" @click="$emit('edit')" />
      </div>
    </div>
  </div>
</template>
