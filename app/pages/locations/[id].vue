<script setup lang="ts">
import type {
  ApiResponse,
  Building,
  LocationWithBuildingsDetail,
} from '~~/types'
import BuildingHeader from '~/components/buildings/BuildingHeader.vue'
import BuildingEmptyState from '~/components/buildings/BuildingEmptyState.vue'
import BuildingCard from '~/components/buildings/BuildingCard.vue'
import BuildingCreateModal from '~/components/buildings/BuildingCreateModal.vue'
import BuildingEditModal from '~/components/buildings/BuildingEditModal.vue'
import BuildingDeleteModal from '~/components/buildings/BuildingDeleteModal.vue'

const route = useRoute()
const router = useRouter()
const id = parseInt(route.params.id as string)

const { data, refresh, status } = await useFetch<
  ApiResponse<LocationWithBuildingsDetail>
>(`/api/v1/locations/${id}`)
const location = computed(() => data.value?.data)

const buildings = computed(
  () => location.value?.buildings.filter(b => b.type !== 'meadow') ?? []
)
const meadows = computed(
  () => location.value?.buildings.filter(b => b.type === 'meadow') ?? []
)

useHead(computed(() => ({ title: location.value?.name ?? 'Exploitation' })))

watchEffect(() => {
  if (status.value === 'success' && !location.value)
    router.replace('/locations')
})

// ---- Create ----
const isCreateOpen = ref(false)

// ---- Edit ----
const isEditOpen = ref(false)
const editTarget = ref<Building | null>(null)

function openEdit(building: Building) {
  editTarget.value = building
  isEditOpen.value = true
}

// ---- Delete ----
const isDeleteOpen = ref(false)
const deleteTarget = ref<Building | null>(null)

function openDelete(building: Building) {
  deleteTarget.value = building
  isDeleteOpen.value = true
}
</script>

<template>
  <UContainer class="py-10 max-w-5xl">
    <div v-if="location">
      <div class="flex items-end justify-between mb-0">
        <BuildingHeader :location="location" />
        <div class="mb-8">
          <UButton
            aria-label="Nouveau bâtiment ou pré"
            class="max-sm:size-12 max-sm:rounded-full max-sm:px-0 max-sm:py-0 max-sm:flex max-sm:items-center max-sm:justify-center"
            @click="isCreateOpen = true"
          >
            <span class="sm:hidden flex items-center justify-center">
              <UIcon name="i-lucide-plus" class="size-6" />
            </span>
            <span class="hidden sm:inline-flex sm:items-center sm:gap-2">
              <UIcon name="i-lucide-plus" class="size-4" />
              Nouveau
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
          class="h-32 rounded-xl animate-pulse bg-gray-100 dark:bg-gray-800"
        />
      </div>

      <!-- Empty state -->
      <BuildingEmptyState
        v-else-if="!location.buildings.length"
        @click="isCreateOpen = true"
      />

      <template v-else>
        <!-- Section Bâtiments -->
        <div v-if="buildings.length">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-2">
            <UIcon name="i-lucide-building-2" class="size-4" />
            Bâtiments
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <UCard
              v-for="building in buildings"
              :key="building.id"
              class="flex flex-col"
            >
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-2 min-w-0">
                  <div
                    class="p-2 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 shrink-0 flex items-center justify-center"
                  >
                    <UIcon name="i-lucide-building-2" class="size-5 text-amber-500" />
                  </div>
                  <h3 class="font-semibold text-base truncate">
                    {{ building.name }}
                  </h3>
                </div>
                <div class="flex gap-1 ml-2 shrink-0">
                  <UButton
                    icon="i-lucide-pencil"
                    color="neutral"
                    variant="subtle"
                    size="md"
                    aria-label="Modifier"
                    @click="openEdit(building)"
                  />
                  <UButton
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="subtle"
                    size="md"
                    aria-label="Supprimer"
                    @click="openDelete(building)"
                  />
                </div>
              </div>
              <BuildingCard :building="building" />
            </UCard>
          </div>
        </div>

        <!-- Section Prés -->
        <div v-if="meadows.length">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-2">
            <UIcon name="i-lucide-trees" class="size-4" />
            Prés
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <UCard
              v-for="meadow in meadows"
              :key="meadow.id"
              class="flex flex-col"
            >
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-2 min-w-0">
                  <div
                    class="p-2 rounded-lg bg-green-500/10 dark:bg-green-500/20 shrink-0 flex items-center justify-center"
                  >
                    <UIcon name="i-lucide-trees" class="size-5 text-green-500" />
                  </div>
                  <h3 class="font-semibold text-base truncate">
                    {{ meadow.name }}
                  </h3>
                </div>
                <div class="flex gap-1 ml-2 shrink-0">
                  <UButton
                    icon="i-lucide-pencil"
                    color="neutral"
                    variant="subtle"
                    size="md"
                    aria-label="Modifier"
                    @click="openEdit(meadow)"
                  />
                  <UButton
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="subtle"
                    size="md"
                    aria-label="Supprimer"
                    @click="openDelete(meadow)"
                  />
                </div>
              </div>
              <BuildingCard :building="meadow" />
            </UCard>
          </div>
        </div>
      </template>
    </div>

    <BuildingCreateModal
      :open="isCreateOpen"
      :location-id="id"
      @created="refresh"
      @close="isCreateOpen = false"
    />
    <BuildingEditModal
      :open="isEditOpen"
      :building="editTarget"
      @updated="refresh"
      @close="isEditOpen = false"
    />
    <BuildingDeleteModal
      :open="isDeleteOpen"
      :building="deleteTarget"
      @deleted="refresh"
      @close="isDeleteOpen = false"
    />
  </UContainer>
</template>
