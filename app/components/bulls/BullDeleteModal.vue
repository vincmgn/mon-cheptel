<script lang="ts" setup>
import type { Bull } from '~~/types'
import { getErrorMessage } from '~/utils/error'

const props = defineProps<{
  open: boolean
  bull: Bull | null
}>()

const emit = defineEmits<{
  (e: 'deleted' | 'close'): void
}>()

const isDeleting = ref(false)
const toast = useToast()

async function confirmDelete() {
  if (!props.bull) return
  isDeleting.value = true
  try {
    await $fetch(`/api/v1/bulls/${props.bull.id}`, { method: 'DELETE' })
    toast.add({ title: 'Taureau supprimé', color: 'success' })
    emit('deleted')
  } catch (e) {
    toast.add({ title: 'Impossible de supprimer', description: getErrorMessage(e), color: 'error' })
  } finally {
    isDeleting.value = false
    emit('close')
  }
}
</script>

<template>
  <div>
    <UModal :open="open" title="Supprimer le taureau" @update:open="emit('close')">
      <template #body>
        <p class="text-gray-700 dark:text-gray-300">
          Êtes-vous sûr de vouloir supprimer <strong>{{ bull?.name }}</strong> ?
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Cette action est irréversible.
        </p>
        <div class="flex justify-end gap-2 mt-6">
          <UButton color="neutral" variant="outline" @click="emit('close')">Annuler</UButton>
          <UButton color="error" :loading="isDeleting" @click="confirmDelete">Supprimer</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
