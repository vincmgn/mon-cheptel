<script lang="ts" setup>
const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <div>
    <UButton
      class="fixed top-8 right-6 size-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50 cursor-pointer"
      aria-label="Nouvelle location" @click="$emit('click')">
      <UIcon name="i-lucide-plus" class="size-6" />
    </UButton>
  </div>
</template>
