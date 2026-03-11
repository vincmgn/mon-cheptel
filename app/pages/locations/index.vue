<script setup lang="ts">
import LocationCreateModal from '~/components/locations/LocationCreateModal.vue'
import LocationEditModal from '~/components/locations/LocationEditModal.vue'
import LocationDeleteModal from '~/components/locations/LocationDeleteModal.vue'
import LocationList from '~/components/locations/LocationList.vue'
import LocationEmptyState from '~/components/locations/LocationEmptyState.vue'
import LocationHeader from '~/components/locations/LocationHeader.vue'
import type {
  ApiResponse,
  Location,
  LocationWithBuildingsCount,
} from '~~/types'

useHead({ title: 'Exploitations' })

const { data, refresh, status } =
  await useFetch<ApiResponse<LocationWithBuildingsCount[]>>('/api/v1/locations')
const locations = computed(() => data.value?.data ?? [])

const isCreateOpen = ref(false)

// ---- Edit ----
const isEditOpen = ref(false)
const editTarget = ref<Location | null>(null)

function openEdit(location: Location) {
  editTarget.value = location
  isEditOpen.value = true
}

// ---- Delete ----
const isDeleteOpen = ref(false)
const deleteTarget = ref<Location | null>(null)

function openDelete(location: Location) {
  deleteTarget.value = location
  isDeleteOpen.value = true
}
</script>

<template>
  <UContainer class="py-10 max-w-5xl">
    <!-- Header -->
    <div v-if="locations">
      <div class="flex items-end justify-between mb-0">
        <LocationHeader :locations="locations" />
        <div class="mb-8">
          <UButton
            aria-label="Nouveau lieu"
            class="max-sm:size-12 max-sm:rounded-full max-sm:px-0 max-sm:py-0 max-sm:flex max-sm:items-center max-sm:justify-center"
            @click="isCreateOpen = true"
          >
            <span class="sm:hidden flex items-center justify-center">
              <UIcon name="i-lucide-plus" class="size-6" />
            </span>
            <span class="hidden sm:inline-flex sm:items-center sm:gap-2">
              <UIcon name="i-lucide-plus" class="size-4" />
              Nouveau lieu
            </span>
          </UButton>
        </div>
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
        class="h-40 rounded-xl animate-pulse bg-gray-100 dark:bg-gray-800"
      />
    </div>

    <!-- Empty state -->
    <LocationEmptyState
      v-else-if="locations.length === 0"
      @click="isCreateOpen = true"
    />

    <!-- Card grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard
        v-for="location in locations"
        :key="location.id"
        class="flex flex-col"
      >
        <!-- Card header -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2 min-w-0">
            <div
              class="p-2 rounded-lg bg-primary/10 dark:bg-primary/20 shrink-0 flex items-center justify-center"
            >
              <UIcon name="i-lucide-map-pin" class="size-5 text-primary" />
            </div>
            <h3 class="font-semibold text-base truncate">
              {{ location.name }}
            </h3>
          </div>
          <div class="flex gap-1 ml-2 shrink-0">
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="subtle"
              size="md"
              aria-label="Modifier"
              @click="openEdit(location)"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="subtle"
              size="md"
              aria-label="Supprimer"
              @click="openDelete(location)"
            />
          </div>
        </div>

        <!-- Buildings list -->
        <LocationList :location="location" />
      </UCard>
    </div>

    <!-- Create Modal -->
    <LocationCreateModal
      :open="isCreateOpen"
      @created="refresh"
      @close="isCreateOpen = false"
    />

    <!-- Edit Modal -->
    <LocationEditModal
      :open="isEditOpen"
      :location="editTarget"
      @updated="refresh"
      @close="isEditOpen = false"
    />

    <!-- Delete Modal -->
    <LocationDeleteModal
      :open="isDeleteOpen"
      :location="deleteTarget"
      @deleted="refresh"
      @close="isDeleteOpen = false"
    />
  </UContainer>
</template>
