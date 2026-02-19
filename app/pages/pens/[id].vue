<script setup lang="ts">
import type { ApiResponse, PenWithCows } from '~~/types'
import { getErrorMessage } from '~/utils/error'

const route = useRoute()
const router = useRouter()
const id = parseInt(route.params.id as string)
const toast = useToast()

const { data, refresh, status } = await useFetch<ApiResponse<PenWithCows>>(
  `/api/v1/pens/${id}`
)
const pen = computed(() => data.value?.data)

watchEffect(() => {
  if (status.value === 'success' && !pen.value) router.replace('/locations')
})

// ---- Create cow ----
const isCreateOpen = ref(false)
const createOfficialId = ref('')
const createProphylaxis = ref(false)
const isCreating = ref(false)

async function createCow() {
  isCreating.value = true
  try {
    await $fetch('/api/v1/cows', {
      method: 'POST',
      body: {
        officialId: createOfficialId.value.trim(),
        penId: id,
        prophylaxis: createProphylaxis.value,
      },
    })
    toast.add({ title: 'Vache ajoutée', color: 'success' })
    createOfficialId.value = ''
    createProphylaxis.value = false
    isCreateOpen.value = false
    await refresh()
  } catch (e) {
    toast.add({ title: 'Erreur', description: getErrorMessage(e), color: 'error' })
  } finally {
    isCreating.value = false
  }
}

// ---- Delete cow ----
const isDeleteOpen = ref(false)
const deleteTarget = ref<{ id: number; officialId: string } | null>(null)
const isDeleting = ref(false)

function openDelete(cow: { id: number; officialId: string }) {
  deleteTarget.value = cow
  isDeleteOpen.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  isDeleting.value = true
  try {
    await $fetch(`/api/v1/cows/${deleteTarget.value.id}`, { method: 'DELETE' })
    toast.add({ title: 'Vache supprimée', color: 'success' })
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
        v-if="pen"
        :to="`/buildings/${pen.building.id}`"
        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <UIcon name="i-lucide-arrow-left" class="size-5" />
      </NuxtLink>
      <div class="flex-1 min-w-0">
        <p v-if="pen" class="text-xs text-gray-400 mb-0.5">
          <NuxtLink :to="`/locations/${pen.building.location.id}`" class="hover:underline">
            {{ pen.building.location.name }}
          </NuxtLink>
          ›
          <NuxtLink :to="`/buildings/${pen.building.id}`" class="hover:underline">
            {{ pen.building.name }}
          </NuxtLink>
        </p>
        <h1 class="text-2xl font-bold">{{ pen?.name ?? '…' }}</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {{ pen?.cows.length ?? 0 }} vache{{ (pen?.cows.length ?? 0) !== 1 ? 's' : '' }}
        </p>
      </div>
      <UButton icon="i-lucide-plus" @click="isCreateOpen = true">
        Ajouter une vache
      </UButton>
    </div>

    <div class="mt-8">
      <!-- Loading skeletons -->
      <div v-if="status === 'pending'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 3" :key="i" class="h-24 rounded-xl animate-pulse bg-gray-100 dark:bg-gray-800" />
      </div>

      <!-- Empty state -->
      <div
        v-else-if="!pen?.cows.length"
        class="text-center py-20 text-gray-400 dark:text-gray-500"
      >
        <UIcon name="i-lucide-beef" class="size-12 mx-auto mb-4 opacity-50" />
        <p class="text-lg font-medium">Aucune vache</p>
        <p class="text-sm mt-1">Ajoutez la première vache de cette case.</p>
        <UButton class="mt-6" icon="i-lucide-plus" @click="isCreateOpen = true">
          Ajouter une vache
        </UButton>
      </div>

      <!-- Cows list -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard v-for="cow in pen?.cows" :key="cow.id" class="flex flex-col">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-2 min-w-0">
              <div class="p-2 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 shrink-0 flex items-center justify-center">
                <UIcon name="i-lucide-beef" class="size-5 text-orange-500" />
              </div>
              <div class="min-w-0">
                <h3 class="font-semibold text-base truncate">🐄 {{ cow.officialId }}</h3>
              </div>
            </div>
            <div class="flex gap-1 ml-2 shrink-0">
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="subtle"
                size="md"
                aria-label="Supprimer"
                @click="openDelete(cow)"
              />
            </div>
          </div>

          <div class="mt-3 flex flex-wrap gap-2">
            <UBadge v-if="cow.prophylaxis" color="success" variant="subtle">
              <UIcon name="i-lucide-shield-check" class="size-3 mr-1" />
              Prophylaxie
            </UBadge>
            <UBadge color="neutral" variant="subtle">
              {{ cow._count.calves }} veau{{ cow._count.calves !== 1 ? 'x' : '' }}
            </UBadge>
            <UBadge color="neutral" variant="subtle">
              {{ cow._count.breedings }} saillie{{ cow._count.breedings !== 1 ? 's' : '' }}
            </UBadge>
          </div>

          <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <NuxtLink :to="`/cows/${cow.id}`">
              <UBadge color="primary" variant="subtle" class="cursor-pointer">
                Voir la fiche →
              </UBadge>
            </NuxtLink>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Create modal -->
    <UModal v-model:open="isCreateOpen" title="Ajouter une vache" description="Enregistrer une nouvelle vache dans cette case.">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Numéro officiel" required>
            <UInput
              v-model="createOfficialId"
              placeholder="Ex: FR 12345678901"
              autofocus
              class="w-full"
            />
          </UFormField>
          <UFormField>
            <UCheckbox v-model="createProphylaxis" label="Prophylaxie réalisée" />
          </UFormField>
          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" @click="isCreateOpen = false">Annuler</UButton>
            <UButton :loading="isCreating" :disabled="!createOfficialId.trim()" @click="createCow">Ajouter</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Delete modal -->
    <UModal v-model:open="isDeleteOpen" title="Supprimer la vache">
      <template #body>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Supprimer la vache <strong>{{ deleteTarget?.officialId }}</strong> ?
          Supprimez d'abord ses saillies et veaux depuis la fiche vache avant de la supprimer.
        </p>
        <div class="flex justify-end gap-2 pt-4">
          <UButton color="neutral" variant="outline" @click="isDeleteOpen = false">Annuler</UButton>
          <UButton color="error" :loading="isDeleting" @click="confirmDelete">Supprimer</UButton>
        </div>
      </template>
    </UModal>
  </UContainer>
</template>
