<script setup lang="ts">
const toaster = { position: 'bottom-left' } as const
</script>
<template>
  <UApp :toaster="toaster">
    <NuxtPage />
  </UApp>
</template>
