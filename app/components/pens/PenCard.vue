<script lang="ts" setup>
import type { Pen } from '~~/types'

defineProps<{
  pen: Pen & { _count: { cows: number } }
}>()
</script>

<template>
  <div>
    <div class="mt-3 flex-1">
      <UBadge color="neutral" variant="subtle">
        {{ pen._count.cows }} vache{{ pen._count.cows !== 1 ? 's' : '' }}
      </UBadge>
    </div>
    <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
      <NuxtLink :to="`/pens/${pen.id}`">
        <UBadge color="primary" variant="subtle" class="cursor-pointer">
          Voir les vaches →
        </UBadge>
      </NuxtLink>
    </div>
  </div>
</template>
