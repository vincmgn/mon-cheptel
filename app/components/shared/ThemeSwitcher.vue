<script setup lang="ts">
const {
  currentColor,
  themeColors,
  themePreviews,
  setColor,
  toggleDark,
  isDark,
} = useTheme()
</script>

<template>
  <div class="flex items-center gap-2">
    <!-- Color swatches -->
    <div class="flex items-center gap-1.5">
      <button
        v-for="color in themeColors"
        :key="color"
        class="size-5 rounded-full transition-transform hover:scale-110 ring-offset-2 ring-offset-white dark:ring-offset-gray-900"
        :class="
          currentColor === color
            ? 'ring-2 ring-gray-400 dark:ring-gray-500'
            : ''
        "
        :style="{ backgroundColor: themePreviews[color] }"
        :title="color"
        @click="setColor(color)"
      />
    </div>

    <!-- Dark / light toggle -->
    <UButton
      :icon="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
      color="neutral"
      variant="ghost"
      size="sm"
      :title="isDark ? 'Mode clair' : 'Mode sombre'"
      @click="toggleDark"
    />
  </div>
</template>
