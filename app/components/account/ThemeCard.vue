<script setup lang="ts">
const {
  currentColor,
  themeColors,
  themePreviews,
  setColor,
  toggleDark,
  isDark,
} = useTheme()

const COLOR_LABELS: Record<string, string> = {
  green: 'Vert',
  sky: 'Bleu',
  violet: 'Violet',
  orange: 'Orange',
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-palette" class="size-4 text-primary" />
        <h2 class="font-semibold">Apparence</h2>
      </div>
    </template>

    <div class="flex flex-col gap-5">
      <!-- Color theme -->
      <div>
        <p class="text-sm font-medium mb-3">Couleur principale</p>
        <div class="flex items-center gap-3">
          <button
            v-for="color in themeColors"
            :key="color"
            class="flex flex-col items-center gap-1.5 group"
            @click="setColor(color)"
          >
            <span
              class="size-8 rounded-full transition-transform group-hover:scale-110 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 flex items-center justify-center"
              :class="
                currentColor === color
                  ? 'ring-2 ring-gray-400 dark:ring-gray-500 scale-110'
                  : ''
              "
              :style="{ backgroundColor: themePreviews[color] }"
            >
              <UIcon
                v-if="currentColor === color"
                name="i-lucide-check"
                class="size-4 text-white"
              />
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ COLOR_LABELS[color] }}
            </span>
          </button>
        </div>
      </div>

      <!-- Dark / light mode -->
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium">Mode sombre</p>
          <p class="text-xs text-gray-400 dark:text-gray-500">
            {{ isDark ? 'Activé' : 'Désactivé' }}
          </p>
        </div>
        <UButton
          :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
          :label="isDark ? 'Clair' : 'Sombre'"
          color="neutral"
          variant="outline"
          size="sm"
          @click="toggleDark"
        />
      </div>
    </div>
  </UCard>
</template>
