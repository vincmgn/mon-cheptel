<script lang="ts" setup>
import { getErrorMessage } from '~/utils/error'

const props = defineProps<{
  open: boolean
  locationId: number
}>()

const emit = defineEmits<{
  (e: 'created' | 'close'): void
}>()

const name = ref('')
const type = ref<'building' | 'meadow'>('building')
const isCreating = ref(false)
const toast = useToast()

watch(
  () => props.open,
  isOpen => {
    if (!isOpen) {
      name.value = ''
      type.value = 'building'
    }
  }
)

async function onSubmit() {
  isCreating.value = true
  try {
    await $fetch('/api/v1/buildings', {
      method: 'POST',
      body: {
        name: name.value.trim(),
        locationId: props.locationId,
        type: type.value,
      },
    })
    toast.add({
      title: type.value === 'meadow' ? 'Pré créé' : 'Bâtiment créé',
      color: 'success',
    })
    emit('created')
    name.value = ''
    type.value = 'building'
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
    <UModal
      :open="open"
      :title="type === 'meadow' ? 'Nouveau pré' : 'Nouveau bâtiment'"
      @update:open="emit('close')"
    >
      <template #body>
        <div class="space-y-4">
          <UFormField label="Type" required>
            <div class="flex gap-2">
              <UButton
                :color="type === 'building' ? 'primary' : 'neutral'"
                :variant="type === 'building' ? 'solid' : 'outline'"
                icon="i-lucide-building-2"
                @click="type = 'building'"
              >
                Bâtiment
              </UButton>
              <UButton
                :color="type === 'meadow' ? 'primary' : 'neutral'"
                :variant="type === 'meadow' ? 'solid' : 'outline'"
                icon="i-lucide-trees"
                @click="type = 'meadow'"
              >
                Pré
              </UButton>
            </div>
          </UFormField>
          <UFormField
            :label="type === 'meadow' ? 'Nom du pré' : 'Nom du bâtiment'"
            required
          >
            <UInput
              v-model="name"
              :placeholder="
                type === 'meadow' ? 'Ex: Grand pré' : 'Ex: Étable A'
              "
              autofocus
              class="w-full"
            />
          </UFormField>
          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" @click="emit('close')">
              Annuler
            </UButton>
            <UButton
              :loading="isCreating"
              :disabled="!name.trim()"
              @click="onSubmit"
            >
              Créer
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
