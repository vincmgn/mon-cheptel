<script setup lang="ts">
import type { ApiList, Bull, BullWithCount } from '~~/types'
import BullHeader from '~/components/bulls/BullHeader.vue'
import BullEmptyState from '~/components/bulls/BullEmptyState.vue'
import BullCard from '~/components/bulls/BullCard.vue'
import BullCreateModal from '~/components/bulls/BullCreateModal.vue'
import BullEditModal from '~/components/bulls/BullEditModal.vue'
import BullDeleteModal from '~/components/bulls/BullDeleteModal.vue'

useHead({ title: 'Taureaux' })

const { data, refresh, status } =
  await useFetch<ApiList<BullWithCount>>('/api/v1/bulls')
const bulls = computed(() => data.value?.data ?? [])

// ---- Create ----
const isCreateOpen = ref(false)

// ---- Edit ----
const isEditOpen = ref(false)
const editTarget = ref<Bull | null>(null)

function openEdit(bull: Bull) {
  editTarget.value = bull
  isEditOpen.value = true
}

// ---- Delete ----
const isDeleteOpen = ref(false)
const deleteTarget = ref<Bull | null>(null)

function openDelete(bull: Bull) {
  deleteTarget.value = bull
  isDeleteOpen.value = true
}
</script>

<template>
  <UContainer class="py-10 max-w-5xl">
    <div class="flex items-end justify-between">
      <BullHeader :bulls="bulls" />
      <div class="mb-8">
        <UButton icon="i-lucide-plus" @click="isCreateOpen = true"
          >Nouveau taureau</UButton
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
        class="h-32 rounded-xl animate-pulse bg-gray-100 dark:bg-gray-800"
      />
    </div>

    <!-- Empty state -->
    <BullEmptyState v-else-if="!bulls.length" @click="isCreateOpen = true" />

    <!-- Card grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard v-for="bull in bulls" :key="bull.id" class="flex flex-col">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2 min-w-0">
            <div
              class="p-2 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 shrink-0 flex items-center justify-center"
            >
              <UIcon name="i-lucide-shield" class="size-5 text-rose-500" />
            </div>
            <h3 class="font-semibold text-base truncate">🐂 {{ bull.name }}</h3>
          </div>
          <div class="flex gap-1 ml-2 shrink-0">
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="subtle"
              size="md"
              aria-label="Modifier"
              @click="openEdit(bull)"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="subtle"
              size="md"
              aria-label="Supprimer"
              @click="openDelete(bull)"
            />
          </div>
        </div>
        <BullCard :bull="bull" />
      </UCard>
    </div>

    <BullCreateModal
      :open="isCreateOpen"
      @created="refresh"
      @close="isCreateOpen = false"
    />
    <BullEditModal
      :open="isEditOpen"
      :bull="editTarget"
      @updated="refresh"
      @close="isEditOpen = false"
    />
    <BullDeleteModal
      :open="isDeleteOpen"
      :bull="deleteTarget"
      @deleted="refresh"
      @close="isDeleteOpen = false"
    />
  </UContainer>
</template>
