<script lang="ts" setup>
import type { CowDetail, BullWithCount } from '~~/types'
import { getErrorMessage } from '~/utils/error'

const props = defineProps<{
  cow: CowDetail
  bulls: BullWithCount[]
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const toast = useToast()

// ---- Add breeding ----
const isOpen = ref(false)
const date = ref(new Date().toISOString().split('T')[0])
const bullType = ref<'existing' | 'external'>('existing')
const bullId = ref<number | null>(null)
const bullName = ref('')
const isMaybe = ref(false)
const isAdding = ref(false)

const bullOptions = computed(() =>
  props.bulls.map(b => ({ label: b.name, value: b.id }))
)

function openModal() {
  date.value = new Date().toISOString().split('T')[0]
  bullType.value = 'existing'
  bullId.value = props.bulls[0]?.id ?? null
  bullName.value = ''
  isMaybe.value = false
  isOpen.value = true
}

async function addBreeding() {
  isAdding.value = true
  try {
    const body: Record<string, unknown> = {
      cowId: props.cow.id,
      date: date.value,
      isMaybe: isMaybe.value,
    }
    if (bullType.value === 'existing' && bullId.value)
      body.bullId = bullId.value
    else if (bullType.value === 'external' && bullName.value.trim())
      body.bullName = bullName.value.trim()

    await $fetch('/api/v1/breedings', { method: 'POST', body })
    toast.add({ title: 'Saillie enregistrée', color: 'success' })
    isOpen.value = false
    emit('refresh')
  } catch (e) {
    toast.add({
      title: 'Erreur',
      description: getErrorMessage(e),
      color: 'error',
    })
  } finally {
    isAdding.value = false
  }
}

// ---- Delete breeding ----
const isDeletingId = ref<number | null>(null)

async function deleteBreeding(id: number) {
  isDeletingId.value = id
  try {
    await $fetch(`/api/v1/breedings/${id}`, { method: 'DELETE' })
    emit('refresh')
  } catch (e) {
    toast.add({
      title: 'Erreur',
      description: getErrorMessage(e),
      color: 'error',
    })
  } finally {
    isDeletingId.value = null
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <section>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">🐂 Saillies</h2>
      <UButton size="sm" icon="i-lucide-plus" @click="openModal"
        >Ajouter</UButton
      >
    </div>

    <div
      v-if="!cow.breedings.length"
      class="text-sm text-gray-400 dark:text-gray-500 italic py-4 text-center"
    >
      Aucune saillie enregistrée
    </div>
    <ul v-else class="space-y-2">
      <li
        v-for="breeding in cow.breedings"
        :key="breeding.id"
        class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-medium text-sm">
              🐂
              {{
                breeding.bull?.name ?? breeding.bullName ?? 'Taureau inconnu'
              }}
            </span>
            <UBadge
              v-if="breeding.isMaybe"
              color="warning"
              variant="subtle"
              size="sm"
            >
              Peut-être ?
            </UBadge>
          </div>
          <p class="text-xs text-gray-400 mt-0.5">
            {{ formatDate(breeding.date) }}
          </p>
        </div>
        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          size="sm"
          :loading="isDeletingId === breeding.id"
          @click="deleteBreeding(breeding.id)"
        />
      </li>
    </ul>

    <!-- Modal -->
    <UModal v-model:open="isOpen" title="Enregistrer une saillie">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Date">
            <UInput v-model="date" type="date" class="w-full" />
          </UFormField>

          <UFormField label="Taureau">
            <div class="space-y-3">
              <div class="flex gap-2">
                <UButton
                  :color="bullType === 'existing' ? 'primary' : 'neutral'"
                  :variant="bullType === 'existing' ? 'solid' : 'outline'"
                  size="sm"
                  @click="bullType = 'existing'"
                >
                  De la liste
                </UButton>
                <UButton
                  :color="bullType === 'external' ? 'primary' : 'neutral'"
                  :variant="bullType === 'external' ? 'solid' : 'outline'"
                  size="sm"
                  @click="bullType = 'external'"
                >
                  Externe
                </UButton>
              </div>
              <USelect
                v-if="bullType === 'existing'"
                v-model="bullId"
                :items="bullOptions"
                class="w-full"
                placeholder="Choisir un taureau"
              />
              <UInput
                v-else
                v-model="bullName"
                placeholder="Nom du taureau externe"
                class="w-full"
              />
            </div>
          </UFormField>

          <UFormField>
            <UCheckbox
              v-model="isMaybe"
              label="Résultat incertain (peut-être ?)"
            />
          </UFormField>

          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" @click="isOpen = false"
              >Annuler</UButton
            >
            <UButton
              :loading="isAdding"
              :disabled="bullType === 'existing' ? !bullId : !bullName.trim()"
              @click="addBreeding"
            >
              Enregistrer
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </section>
</template>
