<script lang="ts" setup>
import { getErrorMessage } from '~/utils/error'
import type { Location } from '~~/types'

const props = defineProps<{
  open: boolean
  location: Location | null
}>()

const emit = defineEmits<{
  (e: 'deleted' | 'close'): void
}>()

const isDeleting = ref(false)
const toast = useToast()

async function confirmDelete() {
  if (!props.location) return
  isDeleting.value = true
  try {
    await $fetch(`/api/v1/locations/${props.location.id}`, {
      method: 'DELETE',
    })
    toast.add({ title: 'Lieu supprimé', color: 'success' })
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
    <UModal :open="open" title="Supprimer le lieu" @update:open="emit('close')">
      <template #body>
        <p class="text-gray-700 dark:text-gray-300">
          Êtes-vous sûr de vouloir supprimer
          <strong>{{ props.location?.name }}</strong> ?
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Cette action est irréversible. La suppression échouera si des
          bâtiments sont encore associés à cette location.
        </p>
        <div class="flex justify-end gap-2 mt-6">
          <UButton color="neutral" variant="outline" @click="emit('close')">
            Annuler
          </UButton>
          <UButton color="error" :loading="isDeleting" @click="confirmDelete">
            Supprimer
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style></style>
