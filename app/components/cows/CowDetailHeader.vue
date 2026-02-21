<script lang="ts" setup>
import type { CowDetail } from '~~/types'
import { getErrorMessage } from '~/utils/error'

const props = defineProps<{
  cow: CowDetail
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const isToggling = ref(false)
const toast = useToast()

async function toggleProphylaxis() {
  isToggling.value = true
  try {
    await $fetch(`/api/v1/cows/${props.cow.id}`, {
      method: 'PUT',
      body: { prophylaxis: !props.cow.prophylaxis },
    })
    emit('refresh')
  } catch (e) {
    toast.add({ title: 'Erreur', description: getErrorMessage(e), color: 'error' })
  } finally {
    isToggling.value = false
  }
}
</script>

<template>
  <div class="flex items-center gap-3 mb-8">
    <NuxtLink
      :to="`/pens/${cow.pen.id}`"
      class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
    >
      <UIcon name="i-lucide-arrow-left" class="size-5" />
    </NuxtLink>
    <div class="flex-1 min-w-0">
      <p class="text-xs text-gray-400 mb-0.5 truncate">
        <NuxtLink :to="`/locations/${cow.pen.building.location.id}`" class="hover:underline">
          {{ cow.pen.building.location.name }}
        </NuxtLink>
        ›
        <NuxtLink :to="`/buildings/${cow.pen.building.id}`" class="hover:underline">
          {{ cow.pen.building.name }}
        </NuxtLink>
        ›
        <NuxtLink :to="`/pens/${cow.pen.id}`" class="hover:underline">
          {{ cow.pen.name }}
        </NuxtLink>
      </p>
      <div class="flex items-center gap-3 flex-wrap">
        <h1 class="text-2xl font-bold">🐄 {{ cow.officialId }}</h1>
        <UBadge
          :color="cow.prophylaxis ? 'success' : 'neutral'"
          variant="subtle"
          class="cursor-pointer"
          @click="toggleProphylaxis"
        >
          <UIcon
            :name="cow.prophylaxis ? 'i-lucide-shield-check' : 'i-lucide-shield'"
            class="size-3 mr-1"
          />
          {{ cow.prophylaxis ? 'Prophylaxie ✓' : 'Prophylaxie' }}
        </UBadge>
      </div>
    </div>
  </div>
</template>
