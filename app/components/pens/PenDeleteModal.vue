<script lang="ts" setup>
import type { Pen } from '~~/types'
import { getErrorMessage } from '~/utils/error'

const props = defineProps<{
  open: boolean
  pen: Pen | null
}>()

const emit = defineEmits<{
  (e: 'deleted' | 'close'): void
}>()

const isDeleting = ref(false)
const toast = useToast()

async function confirmDelete() {
  if (!props.pen) return
  isDeleting.value = true
  try {
    await $fetch(`/api/v1/pens/${props.pen.id}`, { method: 'DELETE' })
    toast.add({ title: 'Case supprimée', color: 'success' })
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
    <UModal :open="open" title="Supprimer la case" @update:open="emit('close')">
      <template #body>
        <p class="text-gray-700 dark:text-gray-300">
          Êtes-vous sûr de vouloir supprimer <strong>{{ pen?.name }}</strong> ?
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
          La suppression échouera si des vaches sont encore dans cette case.
        </p>
        <div class="flex justify-end gap-2 mt-6">
          <UButton color="neutral" variant="outline" @click="emit('close')">Annuler</UButton>
          <UButton color="error" :loading="isDeleting" @click="confirmDelete">Supprimer</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
