<script setup lang="ts">
import type { ApiResponse, BuildingWithPens, Pen } from '~~/types'
import { getErrorMessage } from '~/utils/error'

const route = useRoute()
const router = useRouter()
const id = parseInt(route.params.id as string)
const toast = useToast()

const { data, refresh, status } = await useFetch<ApiResponse<BuildingWithPens>>(
  `/api/v1/buildings/${id}`
)
const building = computed(() => data.value?.data)

watchEffect(() => {
  if (status.value === 'success' && !building.value) router.replace('/locations')
})

// ---- Create pen ----
const isCreateOpen = ref(false)
const createName = ref('')
const isCreating = ref(false)

async function createPen() {
  isCreating.value = true
  try {
    await $fetch('/api/v1/pens', {
      method: 'POST',
      body: { name: createName.value.trim(), buildingId: id },
    })
    toast.add({ title: 'Case créée', color: 'success' })
    createName.value = ''
    isCreateOpen.value = false
    await refresh()
  } catch (e) {
    toast.add({ title: 'Erreur', description: getErrorMessage(e), color: 'error' })
  } finally {
    isCreating.value = false
  }
}

// ---- Edit pen ----
const isEditOpen = ref(false)
const editTarget = ref<Pen | null>(null)
const editName = ref('')
const isEditing = ref(false)

function openEdit(pen: Pen) {
  editTarget.value = pen
  editName.value = pen.name
  isEditOpen.value = true
}

async function saveEdit() {
  if (!editTarget.value) return
  isEditing.value = true
  try {
    await $fetch(`/api/v1/pens/${editTarget.value.id}`, {
      method: 'PUT',
      body: { name: editName.value.trim() },
    })
    toast.add({ title: 'Case modifiée', color: 'success' })
    isEditOpen.value = false
    await refresh()
  } catch (e) {
    toast.add({ title: 'Erreur', description: getErrorMessage(e), color: 'error' })
  } finally {
    isEditing.value = false
  }
}

// ---- Delete pen ----
const isDeleteOpen = ref(false)
const deleteTarget = ref<Pen | null>(null)
const isDeleting = ref(false)

function openDelete(pen: Pen) {
  deleteTarget.value = pen
  isDeleteOpen.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  isDeleting.value = true
  try {
    await $fetch(`/api/v1/pens/${deleteTarget.value.id}`, { method: 'DELETE' })
    toast.add({ title: 'Case supprimée', color: 'success' })
    isDeleteOpen.value = false
    await refresh()
  } catch (e) {
    toast.add({ title: 'Erreur', description: getErrorMessage(e), color: 'error' })
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <UContainer class="py-10 max-w-5xl">
    <!-- Header with breadcrumb -->
    <div class="flex items-center gap-3 mb-2">
      <NuxtLink
        v-if="building"
        :to="`/locations/${building.location.id}`"
        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <UIcon name="i-lucide-arrow-left" class="size-5" />
      </NuxtLink>
      <div class="flex-1 min-w-0">
        <p v-if="building" class="text-xs text-gray-400 mb-0.5">
          <NuxtLink :to="`/locations/${building.location.id}`" class="hover:underline">
            {{ building.location.name }}
          </NuxtLink>
        </p>
        <h1 class="text-2xl font-bold">{{ building?.name ?? '…' }}</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {{ building?.pens.length ?? 0 }} case{{ (building?.pens.length ?? 0) !== 1 ? 's' : '' }}
        </p>
      </div>
      <UButton icon="i-lucide-plus" @click="isCreateOpen = true">
        Nouvelle case
      </UButton>
    </div>

    <div class="mt-8">
      <!-- Loading skeletons -->
      <div v-if="status === 'pending'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 3" :key="i" class="h-28 rounded-xl animate-pulse bg-gray-100 dark:bg-gray-800" />
      </div>

      <!-- Empty state -->
      <div
        v-else-if="!building?.pens.length"
        class="text-center py-20 text-gray-400 dark:text-gray-500"
      >
        <UIcon name="i-lucide-layout-grid" class="size-12 mx-auto mb-4 opacity-50" />
        <p class="text-lg font-medium">Aucune case</p>
        <p class="text-sm mt-1">Créez la première case de ce bâtiment.</p>
        <UButton class="mt-6" icon="i-lucide-plus" @click="isCreateOpen = true">
          Nouvelle case
        </UButton>
      </div>

      <!-- Card grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard v-for="pen in building?.pens" :key="pen.id" class="flex flex-col">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-2 min-w-0">
              <div class="p-2 rounded-lg bg-green-500/10 dark:bg-green-500/20 shrink-0 flex items-center justify-center">
                <UIcon name="i-lucide-layout-grid" class="size-5 text-green-500" />
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

          <div class="mt-3 flex-1">
            <UBadge color="neutral" variant="subtle">
              {{ pen._count.cows }} vache{{ pen._count.cows !== 1 ? 's' : '' }}
            </UBadge>
          </div>

          <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <NuxtLink :to="`/pens/${pen.id}`">
              <UBadge color="primary" variant="subtle" class="cursor-pointer">
                Voir les vaches →
              </UBadge>
            </NuxtLink>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Create modal -->
    <UModal v-model:open="isCreateOpen" title="Nouvelle case" description="Ajouter une case à ce bâtiment.">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Nom" required>
            <UInput v-model="createName" placeholder="Ex: Box 1" autofocus class="w-full" />
          </UFormField>
          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" @click="isCreateOpen = false">Annuler</UButton>
            <UButton :loading="isCreating" :disabled="!createName.trim()" @click="createPen">Créer</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Edit modal -->
    <UModal v-model:open="isEditOpen" title="Modifier la case">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Nom" required>
            <UInput v-model="editName" class="w-full" />
          </UFormField>
          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" @click="isEditOpen = false">Annuler</UButton>
            <UButton :loading="isEditing" :disabled="!editName.trim()" @click="saveEdit">Enregistrer</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Delete modal -->
    <UModal v-model:open="isDeleteOpen" title="Supprimer la case">
      <template #body>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Supprimer <strong>{{ deleteTarget?.name }}</strong> ? Cette action est irréversible.
        </p>
        <div class="flex justify-end gap-2 pt-4">
          <UButton color="neutral" variant="outline" @click="isDeleteOpen = false">Annuler</UButton>
          <UButton color="error" :loading="isDeleting" @click="confirmDelete">Supprimer</UButton>
        </div>
      </template>
    </UModal>
  </UContainer>
</template>
