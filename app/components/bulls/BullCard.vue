<script lang="ts" setup>
import type { BullWithCount } from '~~/types'

defineProps<{
  bull: BullWithCount
}>()
</script>

<template>
  <div>
    <div class="mt-3 flex gap-2 flex-wrap">
      <UBadge color="neutral" variant="subtle">
        {{ bull._count.breedings }} saillie{{
          bull._count.breedings !== 1 ? 's' : ''
        }}
      </UBadge>
      <UBadge v-if="bull._count.notes" color="neutral" variant="subtle">
        {{ bull._count.notes }} note{{ bull._count.notes !== 1 ? 's' : '' }}
      </UBadge>
    </div>
    <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
      <NuxtLink :to="`/bulls/${bull.id}`">
        <UBadge color="primary" variant="subtle" class="cursor-pointer">
          Voir la fiche →
        </UBadge>
      </NuxtLink>
    </div>
  </div>
</template>
