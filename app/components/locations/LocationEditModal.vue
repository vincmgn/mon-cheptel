<script lang="ts" setup>
import type { Location } from '~~/types'
import { validateLocationName } from '~/utils/validators'

const props = defineProps<{
  open: boolean
  location: Location | null
}>()

const emit = defineEmits<{
  (e: 'updated' | 'close'): void
}>()

const editState = reactive({ name: '' })
const isEditing = ref(false)
const toast = useToast()

watch(
  () => props.open,
  isOpen => {
    if (isOpen && props.location) {
      editState.name = props.location.name
    }
  }
)

async function onEditSubmit() {
  if (!props.location) return
  isEditing.value = true
  try {
    await $fetch(`/api/v1/locations/${props.location.id}`, {
      method: 'PUT',
      body: { name: editState.name.trim() },
    })
    toast.add({ title: 'Location mise à jour', color: 'success' })
    emit('updated')
  } catch (e) {
    toast.add({
      title: 'Erreur',
      description: getErrorMessage(e),
      color: 'error',
    })
  } finally {
    isEditing.value = false
    emit('close')
  }
}
</script>

<template>
  <div>
    <UModal
      :open="open"
      title="Modifier la location"
      @update:open="emit('close')"
    >
      <template #body>
        <UForm
          :validate="validateLocationName"
          :state="editState"
          :validate-on="[]"
          class="space-y-4"
          @submit="onEditSubmit"
        >
          <UFormField label="Nom" name="name" required>
            <UInput v-model="editState.name" class="w-full" />
          </UFormField>
          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" @click="emit('close')">
              Annuler
            </UButton>
            <UButton type="submit" :loading="isEditing">Enregistrer</UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>
