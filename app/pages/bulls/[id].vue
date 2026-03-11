<script setup lang="ts">
import type { ApiResponse, Bull, BullDetail } from '~~/types'
import BullDetailHeader from '~/components/bulls/BullDetailHeader.vue'
import BullBreedingHistory from '~/components/bulls/BullBreedingHistory.vue'
import BullNoteSection from '~/components/bulls/BullNoteSection.vue'
import BullEditModal from '~/components/bulls/BullEditModal.vue'

const route = useRoute()
const router = useRouter()
const id = parseInt(route.params.id as string)

const { data, refresh, status } = await useFetch<ApiResponse<BullDetail>>(
  `/api/v1/bulls/${id}`
)
const bull = computed(() => data.value?.data)

useHead(computed(() => ({ title: bull.value?.name ?? 'Taureau' })))

watchEffect(() => {
  if (status.value === 'success' && !bull.value) router.replace('/bulls')
})

// ---- Edit name ----
const isEditOpen = ref(false)
const editTarget = ref<Bull | null>(null)

function openEdit() {
  editTarget.value = bull.value ?? null
  isEditOpen.value = true
}
</script>

<template>
  <UContainer class="py-10 max-w-3xl">
    <div v-if="status === 'pending'" class="space-y-4">
      <div
        v-for="i in 3"
        :key="i"
        class="h-24 rounded-xl animate-pulse bg-gray-100 dark:bg-gray-800"
      />
    </div>

    <template v-else-if="bull">
      <BullDetailHeader :bull="bull" @edit="openEdit" />

      <div class="space-y-10">
        <BullBreedingHistory :breedings="bull.breedings" />
        <BullNoteSection
          :notes="bull.notes"
          :bull-id="bull.id"
          @refresh="refresh"
        />
      </div>
    </template>

    <BullEditModal
      :open="isEditOpen"
      :bull="editTarget"
      @updated="refresh"
      @close="isEditOpen = false"
    />
  </UContainer>
</template>
