<script lang="ts" setup>
import { getErrorMessage } from '~/utils/error'

const props = defineProps<{
  open: boolean
  cowIds: number[]
  currentPenId: number
}>()

const emit = defineEmits<{
  (e: 'moved' | 'close'): void
}>()

const toast = useToast()
const isMoving = ref(false)

// Fetch all locations with buildings and pens
const { data: locationsData } = await useFetch('/api/v1/locations')
const locations = computed(() => (locationsData.value as any)?.data ?? [])

// Fetch all pens with building info for destination selection
const { data: pensData } = await useFetch('/api/v1/pens')
const allPens = computed(() => (pensData.value as any)?.data ?? [])

// Build a grouped structure: location > building > pens
const grouped = computed(() => {
  const map: Record<
    number,
    {
      id: number
      name: string
      buildings: Record<
        number,
        {
          id: number
          name: string
          type: string
          pens: Array<{ id: number; name: string; cowCount: number }>
        }
      >
    }
  > = {}

  for (const pen of allPens.value) {
    const loc = pen.building.location
    const bld = pen.building

    if (!map[loc.id]) map[loc.id] = { id: loc.id, name: loc.name, buildings: {} }
    if (!map[loc.id].buildings[bld.id])
      map[loc.id].buildings[bld.id] = {
        id: bld.id,
        name: bld.name,
        type: bld.type ?? 'building',
        pens: [],
      }

    map[loc.id].buildings[bld.id].pens.push({
      id: pen.id,
      name: pen.name,
      cowCount: pen._count.cows,
    })
  }

  return Object.values(map).map(loc => ({
    ...loc,
    buildings: Object.values(loc.buildings),
  }))
})

const selectedPenId = ref<number | null>(null)

watch(
  () => props.open,
  isOpen => {
    if (!isOpen) selectedPenId.value = null
  }
)

async function onMove() {
  if (!selectedPenId.value) return
  isMoving.value = true
  try {
    await $fetch('/api/v1/cows/move', {
      method: 'PATCH',
      body: { cowIds: props.cowIds, targetPenId: selectedPenId.value },
    })
    const count = props.cowIds.length
    toast.add({
      title: `${count} vache${count !== 1 ? 's' : ''} déplacée${count !== 1 ? 's' : ''}`,
      color: 'success',
    })
    emit('moved')
  } catch (e) {
    toast.add({ title: 'Erreur', description: getErrorMessage(e), color: 'error' })
  } finally {
    isMoving.value = false
    emit('close')
  }
}
</script>

<template>
  <UModal
    :open="open"
    :title="`Déplacer ${cowIds.length} vache${cowIds.length !== 1 ? 's' : ''}`"
    @update:open="emit('close')"
  >
    <template #body>
      <div class="space-y-4">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Choisissez la destination (case ou pré) :
        </p>

        <div class="max-h-80 overflow-y-auto pr-1">
          <div v-for="(loc, index) in grouped" :key="loc.id">
            <div v-if="index > 0" class="border-t border-gray-200 dark:border-gray-700 my-3" />
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">
              {{ loc.name }}
            </p>
            <div v-for="bld in loc.buildings" :key="bld.id" class="mb-2">
              <p class="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1">
                <UIcon
                  :name="bld.type === 'meadow' ? 'i-lucide-trees' : 'i-lucide-building-2'"
                  class="size-3"
                />
                {{ bld.name }}
              </p>
              <div class="space-y-1 pl-3">
                <button
                  v-for="pen in bld.pens"
                  :key="pen.id"
                  :disabled="pen.id === currentPenId"
                  class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors"
                  :class="[
                    pen.id === currentPenId
                      ? 'opacity-40 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
                      : selectedPenId === pen.id
                        ? 'bg-primary-500/10 dark:bg-primary-500/20 ring-1 ring-primary-500 cursor-pointer'
                        : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer',
                  ]"
                  @click="pen.id !== currentPenId && (selectedPenId = pen.id)"
                >
                  <span class="font-medium">{{ pen.name }}</span>
                  <UBadge color="neutral" variant="subtle" size="sm">
                    {{ pen.cowCount }} vaches
                  </UBadge>
                </button>
              </div>
            </div>
          </div>

          <p
            v-if="!grouped.length"
            class="text-sm text-gray-400 dark:text-gray-500 italic text-center py-4"
          >
            Aucune destination disponible
          </p>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <UButton color="neutral" variant="outline" @click="emit('close')">
            Annuler
          </UButton>
          <UButton
            :loading="isMoving"
            :disabled="!selectedPenId"
            icon="i-lucide-arrow-right"
            @click="onMove"
          >
            Déplacer
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
