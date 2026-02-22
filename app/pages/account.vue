<script setup lang="ts">
const { user } = useUserSession()
</script>

<template>
  <UContainer class="py-16 max-w-lg">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-10">
      <UButton
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        to="/"
      />
      <div>
        <h1 class="text-2xl font-bold">Mon compte</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ user?.username }}
        </p>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <AccountFarmNameCard />
      <AccountPasswordCard />
      <AccountThemeCard />
    </div>
  </UContainer>
</template>
