<script lang="ts" setup>
import type { CowDetail } from '~~/types'
import { getErrorMessage } from '~/utils/error'

const props = defineProps<{
  cow: CowDetail
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const toast = useToast()

// ---- Add calf ----
const isOpen = ref(false)
const sex = ref<'M' | 'F'>('M')
const birthDate = ref(new Date().toISOString().split('T')[0])
const officialId = ref('')
const isAdding = ref(false)

function openModal() {
  sex.value = 'M'
  birthDate.value = new Date().toISOString().split('T')[0]
  officialId.value = ''
  isOpen.value = true
}

async function addCalf() {
  isAdding.value = true
  try {
    await $fetch('/api/v1/calves', {
      method: 'POST',
      body: {
        cowId: props.cow.id,
        sex: sex.value,
        birthDate: birthDate.value,
        officialId: officialId.value || undefined,
      },
    })
    toast.add({ title: 'Veau ajouté', color: 'success' })
    isOpen.value = false
    emit('refresh')
  } catch (e) {
    toast.add({
      title: 'Erreur',
      description: getErrorMessage(e),
      color: 'error',
    })
  } finally {
    isAdding.value = false
  }
}

// ---- Delete calf ----
const isDeletingId = ref<number | null>(null)

async function deleteCalf(id: number) {
  isDeletingId.value = id
  try {
    await $fetch(`/api/v1/calves/${id}`, { method: 'DELETE' })
    emit('refresh')
  } catch (e) {
    toast.add({
      title: 'Erreur',
      description: getErrorMessage(e),
      color: 'error',
    })
  } finally {
    isDeletingId.value = null
  }
}

// ---- Weighings ----
const expandedCalfId = ref<number | null>(null)

function toggleWeighings(calfId: number) {
  expandedCalfId.value = expandedCalfId.value === calfId ? null : calfId
}

const isWeighingOpen = ref(false)
const weighingCalfId = ref<number | null>(null)
const weighingDate = ref(new Date().toISOString().split('T')[0])
const weighingWeight = ref<number | null>(null)
const isAddingWeighing = ref(false)

function openWeighingModal(calfId: number) {
  weighingCalfId.value = calfId
  weighingDate.value = new Date().toISOString().split('T')[0]
  weighingWeight.value = null
  isWeighingOpen.value = true
}

async function addWeighing() {
  if (!weighingCalfId.value || weighingWeight.value === null) return
  const w = weighingWeight.value
  if (isNaN(w) || w <= 0) {
    toast.add({ title: 'Poids invalide', color: 'error' })
    return
  }
  isAddingWeighing.value = true
  try {
    await $fetch('/api/v1/weighings', {
      method: 'POST',
      body: {
        calfId: weighingCalfId.value,
        weight: w,
        date: weighingDate.value,
      },
    })
    toast.add({ title: 'Pesée ajoutée', color: 'success' })
    isWeighingOpen.value = false
    emit('refresh')
  } catch (e) {
    toast.add({
      title: 'Erreur',
      description: getErrorMessage(e),
      color: 'error',
    })
  } finally {
    isAddingWeighing.value = false
  }
}

const isDeletingWeighingId = ref<number | null>(null)

async function deleteWeighing(id: number) {
  isDeletingWeighingId.value = id
  try {
    await $fetch(`/api/v1/weighings/${id}`, { method: 'DELETE' })
    emit('refresh')
  } catch (e) {
    toast.add({
      title: 'Erreur',
      description: getErrorMessage(e),
      color: 'error',
    })
  } finally {
    isDeletingWeighingId.value = null
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
</script>

<template>
  <section>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">🐃 Veaux</h2>
      <UButton size="sm" icon="i-lucide-plus" @click="openModal"
        >Ajouter</UButton
      >
    </div>

    <div
      v-if="!cow.calves.length"
      class="text-sm text-gray-400 dark:text-gray-500 italic py-4 text-center"
    >
      Aucun veau enregistré
    </div>

    <ul v-else class="space-y-3">
      <li
        v-for="calf in cow.calves"
        :key="calf.id"
        class="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <!-- Calf row -->
        <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <UBadge
                :color="calf.sex === 'M' ? 'primary' : 'error'"
                variant="subtle"
                size="sm"
              >
                {{ calf.sex }}
              </UBadge>
              <span class="font-medium text-sm">{{
                calf.sex === 'M' ? 'Mâle' : 'Femelle'
              }}</span>
              <span
                v-if="calf.officialId"
                class="text-xs font-mono text-gray-500 dark:text-gray-400"
              >
                {{ calf.officialId }}
              </span>
            </div>
            <p class="text-xs text-gray-400 mt-0.5">
              Né(e) le {{ formatDate(calf.birthDate) }}
            </p>
          </div>

          <!-- Weighings toggle -->
          <UButton
            icon="i-lucide-scale"
            color="neutral"
            variant="ghost"
            size="sm"
            :ui="{ base: 'relative' }"
            @click="toggleWeighings(calf.id)"
          >
            <span class="text-xs">
              {{ calf.weighings.length }}
            </span>
          </UButton>

          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            :loading="isDeletingId === calf.id"
            @click="deleteCalf(calf.id)"
          />
        </div>

        <!-- Weighings sub-section -->
        <div
          v-if="expandedCalfId === calf.id"
          class="border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900"
        >
          <div class="flex items-center justify-between mb-2">
            <span
              class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
            >
              Pesées
            </span>
            <UButton
              size="xs"
              icon="i-lucide-plus"
              variant="outline"
              @click="openWeighingModal(calf.id)"
            >
              Ajouter
            </UButton>
          </div>

          <div
            v-if="!calf.weighings.length"
            class="text-xs text-gray-400 italic text-center py-2"
          >
            Aucune pesée enregistrée
          </div>

          <ul v-else class="space-y-1">
            <li
              v-for="w in calf.weighings"
              :key="w.id"
              class="flex items-center justify-between text-sm py-1 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span class="text-gray-500 dark:text-gray-400 text-xs">
                {{ formatDateShort(w.date) }}
              </span>
              <span class="font-semibold">{{ w.weight }} kg</span>
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                size="xs"
                :loading="isDeletingWeighingId === w.id"
                @click="deleteWeighing(w.id)"
              />
            </li>
          </ul>
        </div>
      </li>
    </ul>

    <!-- Modal ajout veau -->
    <UModal v-model:open="isOpen" title="Ajouter un veau">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Sexe" required>
            <div class="flex gap-2">
              <UButton
                :color="sex === 'M' ? 'primary' : 'neutral'"
                :variant="sex === 'M' ? 'solid' : 'outline'"
                @click="sex = 'M'"
              >
                Mâle
              </UButton>
              <UButton
                :color="sex === 'F' ? 'error' : 'neutral'"
                :variant="sex === 'F' ? 'solid' : 'outline'"
                @click="sex = 'F'"
              >
                Femelle
              </UButton>
            </div>
          </UFormField>
          <UFormField label="Date de naissance">
            <UInput v-model="birthDate" type="date" class="w-full" />
          </UFormField>
          <UFormField label="Numéro" hint="Optionnel">
            <UInput
              v-model="officialId"
              placeholder="Ex: FR12345678"
              class="w-full"
            />
          </UFormField>
          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" @click="isOpen = false"
              >Annuler</UButton
            >
            <UButton :loading="isAdding" @click="addCalf">Ajouter</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Modal ajout pesée -->
    <UModal v-model:open="isWeighingOpen" title="Ajouter une pesée">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Date" required>
            <UInput v-model="weighingDate" type="date" class="w-full" />
          </UFormField>
          <UFormField label="Poids (kg)" required>
            <UInput
              v-model="weighingWeight"
              type="number"
              min="0"
              step="0.1"
              placeholder="Ex: 194.5"
              class="w-full"
            />
          </UFormField>
          <div class="flex justify-end gap-2 pt-2">
            <UButton
              color="neutral"
              variant="outline"
              @click="isWeighingOpen = false"
              >Annuler</UButton
            >
            <UButton :loading="isAddingWeighing" @click="addWeighing"
              >Ajouter</UButton
            >
          </div>
        </div>
      </template>
    </UModal>
  </section>
</template>
