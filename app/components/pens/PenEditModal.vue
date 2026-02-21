<script lang="ts" setup>
import type { Pen } from '~~/types'
import { getErrorMessage } from '~/utils/error'

const props = defineProps<{
  open: boolean
  pen: Pen | null
}>()

const emit = defineEmits<{
  (e: 'updated' | 'close'): void
}>()

const name = ref('')
const isEditing = ref(false)
const toast = useToast()

watch(
  () => props.open,
  isOpen => { if (isOpen && props.pen) name.value = props.pen.name }
)

async function onSubmit() {
  if (!props.pen) return
  isEditing.value = true
  try {
    await $fetch(`/api/v1/pens/${props.pen.id}`, {
      method: 'PUT',
      body: { name: name.value.trim() },
    })
    toast.add({ title: 'Case modifiée', color: 'success' })
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
    <UModal :open="open" title="Modifier la case" @update:open="emit('close')">
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
