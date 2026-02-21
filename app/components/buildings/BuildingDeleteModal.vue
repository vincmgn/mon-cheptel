<script lang="ts" setup>
import type { Building } from '~~/types'
import { getErrorMessage } from '~/utils/error'

const props = defineProps<{
  open: boolean
  building: Building | null
}>()

const emit = defineEmits<{
  (e: 'deleted' | 'close'): void
}>()

const isDeleting = ref(false)
const toast = useToast()

async function confirmDelete() {
  if (!props.building) return
  isDeleting.value = true
  try {
    await $fetch(`/api/v1/buildings/${props.building.id}`, { method: 'DELETE' })
    toast.add({ title: 'Bâtiment supprimé', color: 'success' })
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
      title="Supprimer le bâtiment"
      @update:open="emit('close')"
    >
      <template #body>
        <p class="text-gray-700 dark:text-gray-300">
          Êtes-vous sûr de vouloir supprimer
          <strong>{{ building?.name }}</strong> ?
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Cette action est irréversible. La suppression échouera si des cases
          sont encore associées.
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
