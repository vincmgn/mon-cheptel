<script lang="ts" setup>
defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <div class="text-center py-20 text-gray-400 dark:text-gray-500">
    <UIcon name="i-lucide-building-2" class="size-12 mx-auto mb-4 opacity-50" />
    <p class="text-lg font-medium">Aucun bâtiment</p>
    <p class="text-sm mt-1">Créez le premier bâtiment de ce lieu.</p>
    <UButton class="mt-6" icon="i-lucide-plus" @click="$emit('click')">
      Nouveau bâtiment
    </UButton>
  </div>
</template>
