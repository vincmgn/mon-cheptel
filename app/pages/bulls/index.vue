<script setup lang="ts">
import type { ApiList, Bull, BullWithCount } from '~~/types'
import { getErrorMessage } from '~/utils/error'

const toast = useToast()

const { data, refresh, status } = await useFetch<ApiList<BullWithCount>>('/api/v1/bulls')
const bulls = computed(() => data.value?.data ?? [])

// ---- Create ----
const isCreateOpen = ref(false)
const createName = ref('')
const isCreating = ref(false)

async function createBull() {
  isCreating.value = true
  try {
    await $fetch('/api/v1/bulls', {
      method: 'POST',
      body: { name: createName.value.trim() },
    })
    toast.add({ title: 'Taureau ajouté', color: 'success' })
    createName.value = ''
    isCreateOpen.value = false
    await refresh()
  } catch (e) {
    toast.add({ title: 'Erreur', description: getErrorMessage(e), color: 'error' })
  } finally {
    isCreating.value = false
  }
}

// ---- Edit ----
const isEditOpen = ref(false)
const editTarget = ref<Bull | null>(null)
const editName = ref('')
const isEditing = ref(false)

function openEdit(bull: Bull) {
  editTarget.value = bull
  editName.value = bull.name
  isEditOpen.value = true
}

async function saveEdit() {
  if (!editTarget.value) return
  isEditing.value = true
  try {
    await $fetch(`/api/v1/bulls/${editTarget.value.id}`, {
      method: 'PUT',
      body: { name: editName.value.trim() },
    })
    toast.add({ title: 'Taureau modifié', color: 'success' })
    isEditOpen.value = false
    await refresh()
  } catch (e) {
    toast.add({ title: 'Erreur', description: getErrorMessage(e), color: 'error' })
  } finally {
    isEditing.value = false
  }
}

// ---- Delete ----
const isDeleteOpen = ref(false)
const deleteTarget = ref<Bull | null>(null)
const isDeleting = ref(false)

function openDelete(bull: Bull) {
  deleteTarget.value = bull
  isDeleteOpen.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  isDeleting.value = true
  try {
    await $fetch(`/api/v1/bulls/${deleteTarget.value.id}`, { method: 'DELETE' })
    toast.add({ title: 'Taureau supprimé', color: 'success' })
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
        to="/"
        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <UIcon name="i-lucide-arrow-left" class="size-5" />
      </NuxtLink>
      <div class="flex-1">
        <h1 class="text-2xl font-bold">Taureaux</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {{ bulls.length }} taureau{{ bulls.length !== 1 ? 'x' : '' }}
        </p>
      </div>
      <UButton icon="i-lucide-plus" @click="isCreateOpen = true">
        Nouveau taureau
      </UButton>
    </div>

    <!-- Loading skeletons -->
    <div v-if="status === 'pending'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="h-32 rounded-xl animate-pulse bg-gray-100 dark:bg-gray-800" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!bulls.length"
      class="text-center py-20 text-gray-400 dark:text-gray-500"
    >
      <UIcon name="i-lucide-shield" class="size-12 mx-auto mb-4 opacity-50" />
      <p class="text-lg font-medium">Aucun taureau</p>
      <p class="text-sm mt-1">Ajoutez vos reproducteurs mâles.</p>
      <UButton class="mt-6" icon="i-lucide-plus" @click="isCreateOpen = true">
        Nouveau taureau
      </UButton>
    </div>

    <!-- Card grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard v-for="bull in bulls" :key="bull.id" class="flex flex-col">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2 min-w-0">
            <div class="p-2 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 shrink-0 flex items-center justify-center">
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

        <div class="mt-3 flex gap-2 flex-wrap">
          <UBadge color="neutral" variant="subtle">
            {{ bull._count.breedings }} saillie{{ bull._count.breedings !== 1 ? 's' : '' }}
          </UBadge>
          <UBadge v-if="bull._count.notes" color="neutral" variant="subtle">
            {{ bull._count.notes }} note{{ bull._count.notes !== 1 ? 's' : '' }}
          </UBadge>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <NuxtLink :to="`/bulls/${bull.id}`">
            <UBadge color="primary" variant="subtle" class="cursor-pointer">
              Voir la fiche →
            </UBadge>
          </NuxtLink>
        </div>
      </UCard>
    </div>

    <!-- Create modal -->
    <UModal v-model:open="isCreateOpen" title="Nouveau taureau" description="Ajouter un reproducteur mâle.">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Nom" required>
            <UInput v-model="createName" placeholder="Ex: Tornado" autofocus class="w-full" />
          </UFormField>
          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" @click="isCreateOpen = false">Annuler</UButton>
            <UButton :loading="isCreating" :disabled="!createName.trim()" @click="createBull">Créer</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Edit modal -->
    <UModal v-model:open="isEditOpen" title="Modifier le taureau">
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
    <UModal v-model:open="isDeleteOpen" title="Supprimer le taureau">
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
