<script setup lang="ts">
import type { ApiResponse, BuildingWithPens, Pen } from '~~/types'
import PenHeader from '~/components/pens/PenHeader.vue'
import PenEmptyState from '~/components/pens/PenEmptyState.vue'
import PenCard from '~/components/pens/PenCard.vue'
import PenCreateModal from '~/components/pens/PenCreateModal.vue'
import PenEditModal from '~/components/pens/PenEditModal.vue'
import PenDeleteModal from '~/components/pens/PenDeleteModal.vue'

const route = useRoute()
const router = useRouter()
const id = parseInt(route.params.id as string)

const { data, refresh, status } = await useFetch<ApiResponse<BuildingWithPens>>(
  `/api/v1/buildings/${id}`
)
const building = computed(() => data.value?.data)

useHead(computed(() => ({ title: building.value?.name ?? 'Bâtiment' })))

watchEffect(() => {
  if (status.value === 'success' && !building.value)
    router.replace('/locations')
})

// ---- Create ----
const isCreateOpen = ref(false)

// ---- Edit ----
const isEditOpen = ref(false)
const editTarget = ref<Pen | null>(null)

function openEdit(pen: Pen) {
  editTarget.value = pen
  isEditOpen.value = true
}

// ---- Delete ----
const isDeleteOpen = ref(false)
const deleteTarget = ref<Pen | null>(null)

function openDelete(pen: Pen) {
  deleteTarget.value = pen
  isDeleteOpen.value = true
}
</script>

<template>
  <UContainer class="py-10 max-w-5xl">
    <div v-if="building">
      <div class="flex items-end justify-between">
        <PenHeader :building="building" />
        <div class="mb-8">
          <UButton icon="i-lucide-plus" @click="isCreateOpen = true"
            >Nouvelle case</UButton
          >
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
          class="h-28 rounded-xl animate-pulse bg-gray-100 dark:bg-gray-800"
        />
      </div>

      <!-- Empty state -->
      <PenEmptyState
        v-else-if="!building.pens.length"
        @click="isCreateOpen = true"
      />

      <!-- Card grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard v-for="pen in building.pens" :key="pen.id" class="flex flex-col">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-2 min-w-0">
              <div
                class="p-2 rounded-lg bg-green-500/10 dark:bg-green-500/20 shrink-0 flex items-center justify-center"
              >
                <UIcon
                  name="i-lucide-layout-grid"
                  class="size-5 text-green-500"
                />
              </div>
              <h3 class="font-semibold text-base truncate">{{ pen.name }}</h3>
            </div>
            <div class="flex gap-1 ml-2 shrink-0">
              <UButton
                icon="i-lucide-pencil"
                color="neutral"
                variant="subtle"
                size="md"
                aria-label="Modifier"
                @click="openEdit(pen)"
              />
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="subtle"
                size="md"
                aria-label="Supprimer"
                @click="openDelete(pen)"
              />
            </div>
          </div>
          <PenCard :pen="pen" />
        </UCard>
      </div>
    </div>

    <PenCreateModal
      :open="isCreateOpen"
      :building-id="id"
      @created="refresh"
      @close="isCreateOpen = false"
    />
    <PenEditModal
      :open="isEditOpen"
      :pen="editTarget"
      @updated="refresh"
      @close="isEditOpen = false"
    />
    <PenDeleteModal
      :open="isDeleteOpen"
      :pen="deleteTarget"
      @deleted="refresh"
      @close="isDeleteOpen = false"
    />
  </UContainer>
</template>
