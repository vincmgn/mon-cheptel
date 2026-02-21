<script setup lang="ts">
defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <div>
    <div class="text-center py-20 text-gray-400 dark:text-gray-500">
      <UIcon
        name="i-lucide-map-pin-off"
        class="size-12 mx-auto mb-4 opacity-50"
      />
      <p class="text-lg font-medium">Aucune location</p>
      <p class="text-sm mt-1">
        Créez votre premier emplacement pour commencer.
      </p>
      <UButton class="mt-6" icon="i-lucide-plus" @click="$emit('click')">
        Nouvelle location
      </UButton>
    </div>
  </div>
</template>
