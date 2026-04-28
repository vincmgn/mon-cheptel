<script setup lang="ts">
import type { ApiResponse, Cow, PenWithCows } from '~~/types'
import CowHeader from '~/components/cows/CowHeader.vue'
import CowEmptyState from '~/components/cows/CowEmptyState.vue'
import CowCard from '~/components/cows/CowCard.vue'
import CowCreateModal from '~/components/cows/CowCreateModal.vue'
import CowDeleteModal from '~/components/cows/CowDeleteModal.vue'
import CowMoveModal from '~/components/cows/CowMoveModal.vue'

const route = useRoute()
const router = useRouter()
const id = parseInt(route.params.id as string)

const { data, refresh, status } = await useFetch<ApiResponse<PenWithCows>>(
  `/api/v1/pens/${id}`
)
const pen = computed(() => data.value?.data)

useHead(computed(() => ({ title: pen.value?.name ?? 'Box' })))

watchEffect(() => {
  if (status.value === 'success' && !pen.value) router.replace('/locations')
})

// ---- Create ----
const isCreateOpen = ref(false)

// ---- Delete ----
const isDeleteOpen = ref(false)
const deleteTarget = ref<Cow | null>(null)

function openDelete(cow: Cow) {
  deleteTarget.value = cow
  isDeleteOpen.value = true
}

// ---- Multi-select ----
const selectedIds = ref<number[]>([])

function toggleSelect(cowId: number) {
  const idx = selectedIds.value.indexOf(cowId)
  if (idx === -1) selectedIds.value.push(cowId)
  else selectedIds.value.splice(idx, 1)
}

function isSelected(cowId: number) {
  return selectedIds.value.includes(cowId)
}

function toggleSelectAll() {
  if (!pen.value) return
  if (selectedIds.value.length === pen.value.cows.length) {
    selectedIds.value = []
  } else {
    selectedIds.value = pen.value.cows.map(c => c.id)
  }
}

const allSelected = computed(
  () => !!pen.value?.cows.length && selectedIds.value.length === pen.value.cows.length
)

// ---- Move ----
const isMoveOpen = ref(false)

function onMoved() {
  selectedIds.value = []
  refresh()
}
</script>

<template>
  <UContainer class="py-10 max-w-5xl pb-28">
    <div v-if="pen">
      <div class="flex items-end justify-between">
        <CowHeader :pen="pen" />
        <div class="mb-8 flex items-center gap-2">
          <!-- Tout sélectionner (visible si des vaches existent) -->
          <UButton
            v-if="pen.cows.length"
            color="neutral"
            variant="outline"
            size="sm"
            @click="toggleSelectAll"
          >
            {{ allSelected ? 'Tout désélectionner' : 'Tout sélectionner' }}
          </UButton>
          <UButton
            aria-label="Nouvelle vache"
            class="max-sm:size-12 max-sm:rounded-full max-sm:px-0 max-sm:py-0 max-sm:flex max-sm:items-center max-sm:justify-center"
            @click="isCreateOpen = true"
          >
            <span class="sm:hidden flex items-center justify-center">
              <UIcon name="i-lucide-plus" class="size-6" />
            </span>
            <span class="hidden sm:inline-flex sm:items-center sm:gap-2">
              <UIcon name="i-lucide-plus" class="size-4" />
              Nouvelle vache
            </span>
          </UButton>
        </div>
      </div>

      <!-- Loading skeletons -->
      <div
        v-if="status === 'pending'"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="h-24 rounded-xl animate-pulse bg-gray-100 dark:bg-gray-800"
        />
      </div>

      <!-- Empty state -->
      <CowEmptyState
        v-else-if="!pen.cows.length"
        @click="isCreateOpen = true"
      />

      <!-- Card grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard
          v-for="cow in pen.cows"
          :key="cow.id"
          class="flex flex-col cursor-pointer transition-all"
          :class="isSelected(cow.id) ? 'ring-2 ring-primary-500' : ''"
          @click="toggleSelect(cow.id)"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-2 min-w-0">
              <!-- Checkbox visuel -->
              <div
                class="size-5 rounded border-2 shrink-0 flex items-center justify-center transition-colors"
                :class="
                  isSelected(cow.id)
                    ? 'bg-primary-500 border-primary-500'
                    : 'border-gray-300 dark:border-gray-600'
                "
              >
                <UIcon
                  v-if="isSelected(cow.id)"
                  name="i-lucide-check"
                  class="size-3 text-white"
                />
              </div>
              <div
                class="p-2 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 shrink-0 flex items-center justify-center"
              >
                🐄
              </div>
              <h3 class="font-semibold text-base truncate">
                {{ cow.officialId }}
              </h3>
            </div>
            <div class="flex gap-1 ml-2 shrink-0" @click.stop>
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="subtle"
                size="md"
                aria-label="Supprimer"
                @click="openDelete(cow)"
              />
            </div>
          </div>
          <CowCard :cow="cow" />
        </UCard>
      </div>
    </div>

    <!-- Barre d'action sticky (multi-sélection) -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-full opacity-0"
    >
      <div
        v-if="selectedIds.length"
        class="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-4 pointer-events-none"
      >
        <div
          class="pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
        >
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ selectedIds.length }} vache{{ selectedIds.length !== 1 ? 's' : '' }} sélectionnée{{ selectedIds.length !== 1 ? 's' : '' }}
          </span>
          <UButton
            color="neutral"
            variant="outline"
            size="sm"
            @click="selectedIds = []"
          >
            Annuler
          </UButton>
          <UButton
            icon="i-lucide-arrow-right"
            size="sm"
            @click="isMoveOpen = true"
          >
            Déplacer
          </UButton>
        </div>
      </div>
    </Transition>

    <CowCreateModal
      :open="isCreateOpen"
      :pen-id="id"
      @created="refresh"
      @close="isCreateOpen = false"
    />
    <CowDeleteModal
      :open="isDeleteOpen"
      :cow="deleteTarget"
      @deleted="refresh"
      @close="isDeleteOpen = false"
    />
    <CowMoveModal
      :open="isMoveOpen"
      :cow-ids="selectedIds"
      :current-pen-id="id"
      @moved="onMoved"
      @close="isMoveOpen = false"
    />
  </UContainer>
</template>
