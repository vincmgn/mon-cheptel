<script setup lang="ts">
import type { FormError, TableColumn } from '@nuxt/ui'

interface Building {
  id: number
  name: string
  locationId: number
  _count: { pens: number }
}

interface Location {
  id: number
  name: string
  buildings: Building[]
}

const { data, refresh, status } = await useFetch<{ success: boolean; data: Location[] }>(
  '/api/v1/locations',
)
const locations = computed(() => data.value?.data ?? [])

const toast = useToast()

// ---- Table ----
const columns: TableColumn<Location>[] = [
  { accessorKey: 'id', header: '#', size: 60 },
  { accessorKey: 'name', header: 'Nom' },
  { id: 'buildings', header: 'Bâtiments' },
  { id: 'actions', header: '' },
]

// ---- Create ----
const isCreateOpen = ref(false)
const createState = reactive({ name: '' })
const isCreating = ref(false)

function validateName(state: { name: string }): FormError[] {
  if (!state.name.trim()) return [{ name: 'name', message: 'Le nom est requis' }]
  return []
}

async function onCreateSubmit() {
  isCreating.value = true
  try {
    await $fetch('/api/v1/locations', {
      method: 'POST',
      body: { name: createState.name.trim() },
    })
    toast.add({ title: 'Location créée', color: 'success' })
    isCreateOpen.value = false
    createState.name = ''
    await refresh()
  } catch (e: any) {
    toast.add({
      title: 'Erreur',
      description: e.data?.message ?? 'Une erreur est survenue',
      color: 'error',
    })
  } finally {
    isCreating.value = false
  }
}

// ---- Edit ----
const isEditOpen = ref(false)
const editTarget = ref<Location | null>(null)
const editState = reactive({ name: '' })
const isEditing = ref(false)

function openEdit(location: Location) {
  editTarget.value = location
  editState.name = location.name
  isEditOpen.value = true
}

async function onEditSubmit() {
  if (!editTarget.value) return
  isEditing.value = true
  try {
    await $fetch(`/api/v1/locations/${editTarget.value.id}`, {
      method: 'PUT',
      body: { name: editState.name.trim() },
    })
    toast.add({ title: 'Location mise à jour', color: 'success' })
    isEditOpen.value = false
    await refresh()
  } catch (e: any) {
    toast.add({
      title: 'Erreur',
      description: e.data?.message ?? 'Une erreur est survenue',
      color: 'error',
    })
  } finally {
    isEditing.value = false
  }
}

// ---- Delete ----
const isDeleteOpen = ref(false)
const deleteTarget = ref<Location | null>(null)
const isDeleting = ref(false)

function openDelete(location: Location) {
  deleteTarget.value = location
  isDeleteOpen.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  isDeleting.value = true
  try {
    await $fetch(`/api/v1/locations/${deleteTarget.value.id}`, { method: 'DELETE' })
    toast.add({ title: 'Location supprimée', color: 'success' })
    isDeleteOpen.value = false
    deleteTarget.value = null
    await refresh()
  } catch (e: any) {
    toast.add({
      title: 'Impossible de supprimer',
      description: e.data?.message ?? 'Une erreur est survenue',
      color: 'error',
    })
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <UContainer class="py-10 max-w-4xl">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold">Locations</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ locations.length }} location{{ locations.length !== 1 ? 's' : '' }}
        </p>
      </div>
      <UButton icon="i-lucide-plus" @click="isCreateOpen = true">Nouvelle location</UButton>
    </div>

    <!-- Table -->
    <UTable :data="locations" :columns="columns" :loading="status === 'pending'">
      <template #buildings-cell="{ row }">
        <UBadge color="neutral" variant="subtle">
          {{ row.original.buildings.length }}
          {{ row.original.buildings.length !== 1 ? 'bâtiments' : 'bâtiment' }}
        </UBadge>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex gap-1 justify-end">
          <UButton
            icon="i-lucide-pencil"
            color="neutral"
            variant="ghost"
            size="sm"
            aria-label="Modifier"
            @click="openEdit(row.original)"
          />
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            aria-label="Supprimer"
            @click="openDelete(row.original)"
          />
        </div>
      </template>

      <template #empty>
        <div class="text-center py-10 text-gray-500 dark:text-gray-400">
          Aucune location pour le moment.
        </div>
      </template>
    </UTable>

    <!-- Create Modal -->
    <UModal
      v-model:open="isCreateOpen"
      title="Nouvelle location"
      description="Ajoutez un nouvel emplacement à votre cheptel."
    >
      <template #body>
        <UForm
          :validate="validateName"
          :state="createState"
          class="space-y-4"
          @submit="onCreateSubmit"
        >
          <UFormField label="Nom" name="name" required>
            <UInput
              v-model="createState.name"
              placeholder="Ex: Ferme Nord"
              autofocus
              class="w-full"
            />
          </UFormField>
          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" @click="isCreateOpen = false">
              Annuler
            </UButton>
            <UButton type="submit" :loading="isCreating">Créer</UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <!-- Edit Modal -->
    <UModal v-model:open="isEditOpen" title="Modifier la location">
      <template #body>
        <UForm
          :validate="validateName"
          :state="editState"
          class="space-y-4"
          @submit="onEditSubmit"
        >
          <UFormField label="Nom" name="name" required>
            <UInput v-model="editState.name" class="w-full" />
          </UFormField>
          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" @click="isEditOpen = false">
              Annuler
            </UButton>
            <UButton type="submit" :loading="isEditing">Enregistrer</UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <!-- Delete Modal -->
    <UModal v-model:open="isDeleteOpen" title="Supprimer la location">
      <template #body>
        <p class="text-gray-700 dark:text-gray-300">
          Êtes-vous sûr de vouloir supprimer
          <strong>{{ deleteTarget?.name }}</strong> ?
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Cette action est irréversible. La suppression échouera si des bâtiments sont encore
          associés à cette location.
        </p>
        <div class="flex justify-end gap-2 mt-6">
          <UButton color="neutral" variant="outline" @click="isDeleteOpen = false">
            Annuler
          </UButton>
          <UButton color="error" :loading="isDeleting" @click="confirmDelete">
            Supprimer
          </UButton>
        </div>
      </template>
    </UModal>
  </UContainer>
</template>
