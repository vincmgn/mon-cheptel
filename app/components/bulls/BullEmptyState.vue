<script lang="ts" setup>
defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <div class="text-center py-20 text-gray-400 dark:text-gray-500">
    <UIcon name="i-lucide-shield" class="size-12 mx-auto mb-4 opacity-50" />
    <p class="text-lg font-medium">Aucun taureau</p>
    <p class="text-sm mt-1">Ajoutez vos reproducteurs mâles.</p>
    <UButton class="mt-6" icon="i-lucide-plus" @click="$emit('click')">
      Nouveau taureau
    </UButton>
  </div>
</template>
