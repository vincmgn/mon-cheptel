<script lang="ts" setup>
import type { Location } from '~~/types'
import { FetchError } from 'ofetch'

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
    toast.add({ title: 'Location supprimée', color: 'success' })
    emit('deleted')
  } catch (e) {
    let message = 'Une erreur est survenue'
    if (e instanceof FetchError) {
      message = e.data?.message ?? message
    } else if (e instanceof Error) {
      message = e.message
    }
    toast.add({
      title: 'Impossible de supprimer',
      description: message,
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
      title="Supprimer la location"
      @update:open="emit('close')"
    >
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
