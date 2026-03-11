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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
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
    <ul v-else class="space-y-2">
      <li
        v-for="calf in cow.calves"
        :key="calf.id"
        class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800"
      >
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
            <span v-if="calf.officialId" class="text-xs font-mono text-gray-500 dark:text-gray-400">
              {{ calf.officialId }}
            </span>
          </div>
          <p class="text-xs text-gray-400 mt-0.5">
            Né(e) le {{ formatDate(calf.birthDate) }}
          </p>
        </div>
        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          size="sm"
          :loading="isDeletingId === calf.id"
          @click="deleteCalf(calf.id)"
        />
      </li>
    </ul>

    <!-- Modal -->
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
          <UFormField label="Numéro officiel" hint="Optionnel">
            <UInput v-model="officialId" placeholder="Ex: FR12345678" class="w-full" />
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
  </section>
</template>
