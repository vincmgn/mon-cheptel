<script setup lang="ts">
import type { ApiResponse, Building, LocationWithBuildingsDetail } from '~~/types'
import { getErrorMessage } from '~/utils/error'

const route = useRoute()
const router = useRouter()
const id = parseInt(route.params.id as string)
const toast = useToast()

const { data, refresh, status } = await useFetch<ApiResponse<LocationWithBuildingsDetail>>(
  `/api/v1/locations/${id}`
)
const location = computed(() => data.value?.data)

// redirect if not found
watchEffect(() => {
  if (status.value === 'success' && !location.value) router.replace('/locations')
})

// ---- Create building ----
const isCreateOpen = ref(false)
const createName = ref('')
const isCreating = ref(false)

async function createBuilding() {
  isCreating.value = true
  try {
    await $fetch('/api/v1/buildings', {
      method: 'POST',
      body: { name: createName.value.trim(), locationId: id },
    })
    toast.add({ title: 'Bâtiment créé', color: 'success' })
    createName.value = ''
    isCreateOpen.value = false
    await refresh()
  } catch (e) {
    toast.add({ title: 'Erreur', description: getErrorMessage(e), color: 'error' })
  } finally {
    isCreating.value = false
  }
}

// ---- Edit building ----
const isEditOpen = ref(false)
const editTarget = ref<Building | null>(null)
const editName = ref('')
const isEditing = ref(false)

function openEdit(building: Building) {
  editTarget.value = building
  editName.value = building.name
  isEditOpen.value = true
}

async function saveEdit() {
  if (!editTarget.value) return
  isEditing.value = true
  try {
    await $fetch(`/api/v1/buildings/${editTarget.value.id}`, {
      method: 'PUT',
      body: { name: editName.value.trim() },
    })
    toast.add({ title: 'Bâtiment modifié', color: 'success' })
    isEditOpen.value = false
    await refresh()
  } catch (e) {
    toast.add({ title: 'Erreur', description: getErrorMessage(e), color: 'error' })
  } finally {
    isEditing.value = false
  }
}

// ---- Delete building ----
const isDeleteOpen = ref(false)
const deleteTarget = ref<Building | null>(null)
const isDeleting = ref(false)

function openDelete(building: Building) {
  deleteTarget.value = building
  isDeleteOpen.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  isDeleting.value = true
  try {
    await $fetch(`/api/v1/buildings/${deleteTarget.value.id}`, { method: 'DELETE' })
    toast.add({ title: 'Bâtiment supprimé', color: 'success' })
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
    <!-- Header -->
    <div class="flex items-center gap-3 mb-8">
      <NuxtLink
        to="/locations"
        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <UIcon name="i-lucide-arrow-left" class="size-5" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold">{{ location?.name ?? '…' }}</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {{ location?.buildings.length ?? 0 }} bâtiment{{ (location?.buildings.length ?? 0) !== 1 ? 's' : '' }}
        </p>
      </div>
      <div class="ml-auto">
        <UButton icon="i-lucide-plus" @click="isCreateOpen = true">
          Nouveau bâtiment
        </UButton>
      </div>
    </div>

    <!-- Loading skeletons -->
    <div v-if="status === 'pending'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="h-32 rounded-xl animate-pulse bg-gray-100 dark:bg-gray-800" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!location?.buildings.length"
      class="text-center py-20 text-gray-400 dark:text-gray-500"
    >
      <UIcon name="i-lucide-building-2" class="size-12 mx-auto mb-4 opacity-50" />
      <p class="text-lg font-medium">Aucun bâtiment</p>
      <p class="text-sm mt-1">Créez le premier bâtiment de ce lieu.</p>
      <UButton class="mt-6" icon="i-lucide-plus" @click="isCreateOpen = true">
        Nouveau bâtiment
      </UButton>
    </div>

    <!-- Card grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard v-for="building in location?.buildings" :key="building.id" class="flex flex-col">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2 min-w-0">
            <div class="p-2 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 shrink-0 flex items-center justify-center">
              <UIcon name="i-lucide-building-2" class="size-5 text-amber-500" />
            </div>
            <h3 class="font-semibold text-base truncate">{{ building.name }}</h3>
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

        <div class="mt-4 flex-1">
          <p class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
            {{ building.pens.length }} case{{ building.pens.length !== 1 ? 's' : '' }}
          </p>
          <ul v-if="building.pens.length" class="space-y-1.5">
            <li
              v-for="pen in building.pens"
              :key="pen.id"
              class="flex items-center justify-between text-sm"
            >
              <span class="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                <UIcon name="i-lucide-layout-grid" class="size-4 text-gray-400 shrink-0" />
                {{ pen.name }}
              </span>
              <UBadge color="neutral" variant="subtle" size="md">
                {{ pen._count.cows }} vaches
              </UBadge>
            </li>
          </ul>
          <p v-else class="text-sm text-gray-400 dark:text-gray-500 italic">Aucune case</p>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <NuxtLink :to="`/buildings/${building.id}`">
            <UBadge color="primary" variant="subtle" class="cursor-pointer">
              Voir les cases →
            </UBadge>
          </NuxtLink>
        </div>
      </UCard>
    </div>

    <!-- Create modal -->
    <UModal v-model:open="isCreateOpen" title="Nouveau bâtiment" description="Ajouter un bâtiment à ce lieu.">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Nom" required>
            <UInput v-model="createName" placeholder="Ex: Étable A" autofocus class="w-full" />
          </UFormField>
          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" @click="isCreateOpen = false">Annuler</UButton>
            <UButton :loading="isCreating" :disabled="!createName.trim()" @click="createBuilding">Créer</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Edit modal -->
    <UModal v-model:open="isEditOpen" title="Modifier le bâtiment">
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
    <UModal v-model:open="isDeleteOpen" title="Supprimer le bâtiment">
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
