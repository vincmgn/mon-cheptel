<script setup lang="ts">
import type { FormError } from '@nuxt/ui'

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
  <UContainer class="py-10 max-w-5xl">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-3">
        <NuxtLink to="/" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <UIcon name="i-lucide-arrow-left" class="size-5" />
        </NuxtLink>
        <div>
          <h1 class="text-2xl font-bold">Locations</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {{ locations.length }} location{{ locations.length !== 1 ? 's' : '' }}
          </p>
        </div>
      </div>
      <UButton icon="i-lucide-plus" @click="isCreateOpen = true">Nouvelle location</UButton>
    </div>

    <!-- Loading skeletons -->
    <div v-if="status === 'pending'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      <UIcon name="i-lucide-map-pin-off" class="size-12 mx-auto mb-4 opacity-50" />
      <p class="text-lg font-medium">Aucune location</p>
      <p class="text-sm mt-1">Créez votre premier emplacement pour commencer.</p>
      <UButton class="mt-6" icon="i-lucide-plus" @click="isCreateOpen = true">
        Nouvelle location
      </UButton>
    </div>

    <!-- Card grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard v-for="location in locations" :key="location.id" class="flex flex-col">
        <!-- Card header -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2 min-w-0">
            <div class="p-2 rounded-lg bg-primary/10 dark:bg-primary/20 shrink-0">
              <UIcon name="i-lucide-map-pin" class="size-4 text-primary" />
            </div>
            <h3 class="font-semibold text-base truncate">{{ location.name }}</h3>
          </div>
          <div class="flex gap-1 ml-2 shrink-0">
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="xs"
              aria-label="Modifier"
              @click="openEdit(location)"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="xs"
              aria-label="Supprimer"
              @click="openDelete(location)"
            />
          </div>
        </div>

        <!-- Buildings list -->
        <div class="mt-4 flex-1">
          <p class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
            {{ location.buildings.length }}
            {{ location.buildings.length !== 1 ? 'bâtiments' : 'bâtiment' }}
          </p>
          <ul v-if="location.buildings.length" class="space-y-1.5">
            <li
              v-for="building in location.buildings"
              :key="building.id"
              class="flex items-center justify-between text-sm"
            >
              <span class="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                <UIcon name="i-lucide-building-2" class="size-3.5 text-gray-400 shrink-0" />
                {{ building.name }}
              </span>
              <UBadge color="neutral" variant="subtle" size="xs">
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
