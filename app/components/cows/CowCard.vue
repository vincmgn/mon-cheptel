<script lang="ts" setup>
import type { PenWithCows } from '~~/types'

defineProps<{
  cow: PenWithCows['cows'][0]
}>()

defineEmits<{
  (e: 'delete'): void
}>()
</script>

<template>
  <div>
    <div class="mt-3 flex flex-wrap gap-2">
      <UBadge v-if="cow.prophylaxis" color="success" variant="subtle">
        <UIcon name="i-lucide-shield-check" class="size-3 mr-1" />
        Prophylaxie
      </UBadge>
      <UBadge color="neutral" variant="subtle">
        {{ cow._count.calves }} veau{{ cow._count.calves !== 1 ? 'x' : '' }}
      </UBadge>
      <UBadge color="neutral" variant="subtle">
        {{ cow._count.breedings }} saillie{{ cow._count.breedings !== 1 ? 's' : '' }}
      </UBadge>
    </div>
    <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
      <NuxtLink :to="`/cows/${cow.id}`">
        <UBadge color="primary" variant="subtle" class="cursor-pointer">
          Voir la fiche →
        </UBadge>
      </NuxtLink>
    </div>
  </div>
</template>
