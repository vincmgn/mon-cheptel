<script lang="ts" setup>
import { validateLocationName } from '~/utils/validators'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'created'): void
  (e: 'close'): void
}>()

const createState = reactive({ name: '' })
const isCreating = ref(false)
const toast = useToast()

function closeModal() {
  createState.name = ''
  emit('close')
}

async function onCreateSubmit() {
  isCreating.value = true
  try {
    await $fetch('/api/v1/locations', {
      method: 'POST',
      body: { name: createState.name.trim() },
    })
    toast.add({ title: 'Location créée', color: 'success' })
    emit('created')
    createState.name = ''
  } catch (e: unknown) {
    toast.add({
      title: 'Erreur',
      description: e.message ?? 'Une erreur est survenue',
      color: 'error',
    })
  } finally {
    isCreating.value = false
    closeModal()
  }
}

</script>

<template>
  <div>
    <UModal :open="open" title="Nouvelle location " description="Ajoutez un nouvel emplacement à votre cheptel."
      @update:open="closeModal">
      <template #body>
        <UForm :validate="validateLocationName" :state="createState" :validate-on="[]" class="space-y-4" @submit="onCreateSubmit">
          <UFormField label="Nom" name="name" required>
            <UInput v-model="createState.name" placeholder="Ex: Ferme Nord" autofocus class="w-full" />
          </UFormField>
          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" @click="closeModal">
              Annuler
            </UButton>
            <UButton type="submit" :loading="isCreating">Créer</UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>