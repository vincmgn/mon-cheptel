<script lang="ts" setup>
import { getErrorMessage } from '~/utils/error'

const props = defineProps<{
  open: boolean
  penId: number
}>()

const emit = defineEmits<{
  (e: 'created' | 'close'): void
}>()

const officialId = ref('')
const prophylaxis = ref(false)
const isCreating = ref(false)
const toast = useToast()

watch(
  () => props.open,
  isOpen => {
    if (!isOpen) {
      officialId.value = ''
      prophylaxis.value = false
    }
  }
)

async function onSubmit() {
  isCreating.value = true
  try {
    await $fetch('/api/v1/cows', {
      method: 'POST',
      body: {
        officialId: officialId.value.trim(),
        penId: props.penId,
        prophylaxis: prophylaxis.value,
      },
    })
    toast.add({ title: 'Vache ajoutée', color: 'success' })
    emit('created')
    officialId.value = ''
    prophylaxis.value = false
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
    <UModal :open="open" title="Ajouter une vache" @update:open="emit('close')">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Numéro" required>
            <UInput
              v-model="officialId"
              placeholder="Ex: FR 12345678901"
              autofocus
              class="w-full"
            />
          </UFormField>
          <UFormField>
            <UCheckbox v-model="prophylaxis" label="Prophylaxie réalisée" />
          </UFormField>
          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" @click="emit('close')"
              >Annuler</UButton
            >
            <UButton
              :loading="isCreating"
              :disabled="!officialId.trim()"
              @click="onSubmit"
              >Ajouter</UButton
            >
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
