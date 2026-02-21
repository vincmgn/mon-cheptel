<script lang="ts" setup>
import type { Bull } from '~~/types'
import { getErrorMessage } from '~/utils/error'

const props = defineProps<{
  open: boolean
  bull: Bull | null
}>()

const emit = defineEmits<{
  (e: 'updated' | 'close'): void
}>()

const name = ref('')
const isEditing = ref(false)
const toast = useToast()

watch(
  () => props.open,
  isOpen => { if (isOpen && props.bull) name.value = props.bull.name }
)

async function onSubmit() {
  if (!props.bull) return
  isEditing.value = true
  try {
    await $fetch(`/api/v1/bulls/${props.bull.id}`, {
      method: 'PUT',
      body: { name: name.value.trim() },
    })
    toast.add({ title: 'Taureau modifié', color: 'success' })
    emit('updated')
  } catch (e) {
    toast.add({ title: 'Erreur', description: getErrorMessage(e), color: 'error' })
  } finally {
    isEditing.value = false
    emit('close')
  }
}
</script>

<template>
  <div>
    <UModal :open="open" title="Modifier le taureau" @update:open="emit('close')">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Nom" required>
            <UInput v-model="name" class="w-full" />
          </UFormField>
          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" @click="emit('close')">Annuler</UButton>
            <UButton :loading="isEditing" :disabled="!name.trim()" @click="onSubmit">Enregistrer</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
