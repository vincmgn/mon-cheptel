<script setup lang="ts">
import LocationCreateModal from '~/components/locations/LocationCreateModal.vue'
import LocationEditModal from '~/components/locations/LocationEditModal.vue'
import LocationDeleteModal from '~/components/locations/LocationDeleteModal.vue'
import ButtonNew from '~/components/shared/ButtonNew.vue'
import type {
  ApiResponse,
  Location,
  LocationWithBuildingsCount,
} from '~~/types'

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
    <div class="flex items-center gap-3 mb-8">
      <NuxtLink
        to="/"
        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <UIcon name="i-lucide-arrow-left" class="size-5" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold">Locations</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {{ locations.length }} location{{
            locations.length !== 1 ? 's' : ''
          }}
        </p>
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
    <div
      v-else-if="locations.length === 0"
      class="text-center py-20 text-gray-400 dark:text-gray-500"
    >
      <UIcon
        name="i-lucide-map-pin-off"
        class="size-12 mx-auto mb-4 opacity-50"
      />
      <p class="text-lg font-medium">Aucune location</p>
      <p class="text-sm mt-1">
        Créez votre premier emplacement pour commencer.
      </p>
      <UButton class="mt-6" icon="i-lucide-plus" @click="isCreateOpen = true">
        Nouvelle location
      </UButton>
    </div>

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
        <div class="mt-4 flex-1">
          <p
            class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2"
          >
            {{ location.buildings.length }}
            {{ location.buildings.length !== 1 ? 'bâtiments' : 'bâtiment' }}
          </p>
          <ul v-if="location.buildings.length" class="space-y-1.5">
            <li
              v-for="building in location.buildings"
              :key="building.id"
              class="flex items-center justify-between text-sm"
            >
              <span
                class="flex items-center gap-1.5 text-gray-700 dark:text-gray-300"
              >
                <UIcon
                  name="i-lucide-building-2"
                  class="size-4 text-gray-400 shrink-0"
                />
                {{ building.name }}
              </span>
              <UBadge color="neutral" variant="subtle" size="md">
                {{ building._count.pens }} enclos
              </UBadge>
            </li>
          </ul>
          <p v-else class="text-sm text-gray-400 dark:text-gray-500 italic">
            Aucun bâtiment associé
          </p>
        </div>
      </UCard>
    </div>

    <!-- Floating Action Button -->
    <ButtonNew @click="isCreateOpen = true" />

    <!-- Create Modal -->
    <LocationCreateModal :open="isCreateOpen" @created="refresh" @close="isCreateOpen = false" />

    <!-- Edit Modal -->
    <LocationEditModal :open="isEditOpen" :location="editTarget" @updated="refresh" @close="isEditOpen = false" />

    <!-- Delete Modal -->
    <LocationDeleteModal :open="isDeleteOpen" :location="deleteTarget" @deleted="refresh" @close="isDeleteOpen = false" />
  </UContainer>
</template>
