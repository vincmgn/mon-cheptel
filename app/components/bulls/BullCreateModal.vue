<script lang="ts" setup>
import { getErrorMessage } from '~/utils/error'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'created' | 'close'): void
}>()

const name = ref('')
const isCreating = ref(false)
const toast = useToast()

watch(
  () => props.open,
  isOpen => {
    if (!isOpen) name.value = ''
  }
)

async function onSubmit() {
  isCreating.value = true
  try {
    await $fetch('/api/v1/bulls', {
      method: 'POST',
      body: { name: name.value.trim() },
    })
    toast.add({ title: 'Taureau ajouté', color: 'success' })
    emit('created')
    name.value = ''
  } catch (e) {
    toast.add({
      title: 'Erreur',
      description: getErrorMessage(e),
      color: 'error',
    })
  } finally {
    isCreating.value = false
    emit('close')
  }
}
</script>

<template>
  <div>
    <UModal :open="open" title="Nouveau taureau" @update:open="emit('close')">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Nom" required>
            <UInput
              v-model="name"
              placeholder="Ex: Tornado"
              autofocus
              class="w-full"
            />
          </UFormField>
          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" @click="emit('close')"
              >Annuler</UButton
            >
            <UButton
              :loading="isCreating"
              :disabled="!name.trim()"
              @click="onSubmit"
              >Créer</UButton
            >
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
