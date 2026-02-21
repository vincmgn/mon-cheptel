<script setup lang="ts">
import type { ApiResponse, Cow, PenWithCows } from '~~/types'
import CowHeader from '~/components/cows/CowHeader.vue'
import CowEmptyState from '~/components/cows/CowEmptyState.vue'
import CowCard from '~/components/cows/CowCard.vue'
import CowCreateModal from '~/components/cows/CowCreateModal.vue'
import CowDeleteModal from '~/components/cows/CowDeleteModal.vue'

const route = useRoute()
const router = useRouter()
const id = parseInt(route.params.id as string)

const { data, refresh, status } = await useFetch<ApiResponse<PenWithCows>>(
  `/api/v1/pens/${id}`
)
const pen = computed(() => data.value?.data)

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
</script>

<template>
  <UContainer class="py-10 max-w-5xl">
    <div v-if="pen">
      <div class="flex items-end justify-between">
        <CowHeader :pen="pen" />
        <div class="mb-8">
          <UButton icon="i-lucide-plus" @click="isCreateOpen = true">Ajouter une vache</UButton>
        </div>
      </div>

      <!-- Loading skeletons -->
      <div v-if="status === 'pending'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 3" :key="i" class="h-24 rounded-xl animate-pulse bg-gray-100 dark:bg-gray-800" />
      </div>

      <!-- Empty state -->
      <CowEmptyState v-else-if="!pen.cows.length" @click="isCreateOpen = true" />

      <!-- Card grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard v-for="cow in pen.cows" :key="cow.id" class="flex flex-col">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-2 min-w-0">
              <div class="p-2 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 shrink-0 flex items-center justify-center">
                <UIcon name="i-lucide-beef" class="size-5 text-orange-500" />
              </div>
              <h3 class="font-semibold text-base truncate">🐄 {{ cow.officialId }}</h3>
            </div>
            <div class="flex gap-1 ml-2 shrink-0">
              <UButton icon="i-lucide-trash-2" color="error" variant="subtle" size="md" aria-label="Supprimer" @click="openDelete(cow)" />
            </div>
          </div>
          <CowCard :cow="cow" />
        </UCard>
      </div>
    </div>

    <CowCreateModal :open="isCreateOpen" :pen-id="id" @created="refresh" @close="isCreateOpen = false" />
    <CowDeleteModal :open="isDeleteOpen" :cow="deleteTarget" @deleted="refresh" @close="isDeleteOpen = false" />
  </UContainer>
</template>
