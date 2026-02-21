<script lang="ts" setup>
import type { Cow } from '~~/types'
import { getErrorMessage } from '~/utils/error'

const props = defineProps<{
  open: boolean
  cow: Cow | null
}>()

const emit = defineEmits<{
  (e: 'deleted' | 'close'): void
}>()

const isDeleting = ref(false)
const toast = useToast()

async function confirmDelete() {
  if (!props.cow) return
  isDeleting.value = true
  try {
    await $fetch(`/api/v1/cows/${props.cow.id}`, { method: 'DELETE' })
    toast.add({ title: 'Vache supprimée', color: 'success' })
    emit('deleted')
  } catch (e) {
    toast.add({
      title: 'Impossible de supprimer',
      description: getErrorMessage(e),
      color: 'error',
    })
  } finally {
    isDeleting.value = false
    emit('close')
  }
}
</script>

<template>
  <div>
    <UModal
      :open="open"
      title="Supprimer la vache"
      @update:open="emit('close')"
    >
      <template #body>
        <p class="text-gray-700 dark:text-gray-300">
          Êtes-vous sûr de vouloir supprimer
          <strong>{{ cow?.officialId }}</strong> ?
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Supprimez d'abord ses saillies et veaux depuis la fiche vache.
        </p>
        <div class="flex justify-end gap-2 mt-6">
          <UButton color="neutral" variant="outline" @click="emit('close')"
            >Annuler</UButton
          >
          <UButton color="error" :loading="isDeleting" @click="confirmDelete"
            >Supprimer</UButton
          >
        </div>
      </template>
    </UModal>
  </div>
</template>
