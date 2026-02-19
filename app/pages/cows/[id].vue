<script setup lang="ts">
import type { ApiResponse, ApiList, CowDetail, BullWithCount, Note } from '~~/types'
import { getErrorMessage } from '~/utils/error'

const route = useRoute()
const router = useRouter()
const id = parseInt(route.params.id as string)
const toast = useToast()

const { data, refresh, status } = await useFetch<ApiResponse<CowDetail>>(
  `/api/v1/cows/${id}`
)
const cow = computed(() => data.value?.data)

watchEffect(() => {
  if (status.value === 'success' && !cow.value) router.replace('/locations')
})

// Bulls list for breeding modal
const { data: bullsData } = await useFetch<ApiList<BullWithCount>>('/api/v1/bulls')
const bulls = computed(() => bullsData.value?.data ?? [])

// ---- Prophylaxie toggle ----
const isTogglingProphylaxis = ref(false)
async function toggleProphylaxis() {
  if (!cow.value) return
  isTogglingProphylaxis.value = true
  try {
    await $fetch(`/api/v1/cows/${id}`, {
      method: 'PUT',
      body: { prophylaxis: !cow.value.prophylaxis },
    })
    await refresh()
  } catch (e) {
    toast.add({ title: 'Erreur', description: getErrorMessage(e), color: 'error' })
  } finally {
    isTogglingProphylaxis.value = false
  }
}

// ---- Notes ----
const noteContent = ref('')
const isAddingNote = ref(false)

async function addNote() {
  if (!noteContent.value.trim()) return
  isAddingNote.value = true
  try {
    await $fetch('/api/v1/notes', {
      method: 'POST',
      body: { content: noteContent.value.trim(), cowId: id },
    })
    noteContent.value = ''
    await refresh()
  } catch (e) {
    toast.add({ title: 'Erreur', description: getErrorMessage(e), color: 'error' })
  } finally {
    isAddingNote.value = false
  }
}

const isDeletingNote = ref<number | null>(null)
async function deleteNote(note: Note) {
  isDeletingNote.value = note.id
  try {
    await $fetch(`/api/v1/notes/${note.id}`, { method: 'DELETE' })
    await refresh()
  } catch (e) {
    toast.add({ title: 'Erreur', description: getErrorMessage(e), color: 'error' })
  } finally {
    isDeletingNote.value = null
  }
}

// ---- Saillies ----
const isBreedingOpen = ref(false)
const breedingDate = ref(new Date().toISOString().split('T')[0])
const breedingBullType = ref<'existing' | 'external'>('existing')
const breedingBullId = ref<number | null>(null)
const breedingBullName = ref('')
const breedingIsMaybe = ref(false)
const isAddingBreeding = ref(false)

function openBreedingModal() {
  breedingDate.value = new Date().toISOString().split('T')[0]
  breedingBullType.value = 'existing'
  breedingBullId.value = bulls.value[0]?.id ?? null
  breedingBullName.value = ''
  breedingIsMaybe.value = false
  isBreedingOpen.value = true
}

async function addBreeding() {
  isAddingBreeding.value = true
  try {
    const body: Record<string, unknown> = {
      cowId: id,
      date: breedingDate.value,
      isMaybe: breedingIsMaybe.value,
    }
    if (breedingBullType.value === 'existing' && breedingBullId.value) {
      body.bullId = breedingBullId.value
    } else if (breedingBullType.value === 'external' && breedingBullName.value.trim()) {
      body.bullName = breedingBullName.value.trim()
    }
    await $fetch('/api/v1/breedings', { method: 'POST', body })
    toast.add({ title: 'Saillie enregistrée', color: 'success' })
    isBreedingOpen.value = false
    await refresh()
  } catch (e) {
    toast.add({ title: 'Erreur', description: getErrorMessage(e), color: 'error' })
  } finally {
    isAddingBreeding.value = false
  }
}

const isDeletingBreeding = ref<number | null>(null)
async function deleteBreeding(breedingId: number) {
  isDeletingBreeding.value = breedingId
  try {
    await $fetch(`/api/v1/breedings/${breedingId}`, { method: 'DELETE' })
    await refresh()
  } catch (e) {
    toast.add({ title: 'Erreur', description: getErrorMessage(e), color: 'error' })
  } finally {
    isDeletingBreeding.value = null
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// ---- Veaux ----
const isCalfOpen = ref(false)
const calfSex = ref<'M' | 'F'>('M')
const calfBirthDate = ref(new Date().toISOString().split('T')[0])
const isAddingCalf = ref(false)

function openCalfModal() {
  calfSex.value = 'M'
  calfBirthDate.value = new Date().toISOString().split('T')[0]
  isCalfOpen.value = true
}

async function addCalf() {
  isAddingCalf.value = true
  try {
    await $fetch('/api/v1/calves', {
      method: 'POST',
      body: { cowId: id, sex: calfSex.value, birthDate: calfBirthDate.value },
    })
    toast.add({ title: 'Veau ajouté', color: 'success' })
    isCalfOpen.value = false
    await refresh()
  } catch (e) {
    toast.add({ title: 'Erreur', description: getErrorMessage(e), color: 'error' })
  } finally {
    isAddingCalf.value = false
  }
}

const isDeletingCalf = ref<number | null>(null)
async function deleteCalf(calfId: number) {
  isDeletingCalf.value = calfId
  try {
    await $fetch(`/api/v1/calves/${calfId}`, { method: 'DELETE' })
    await refresh()
  } catch (e) {
    toast.add({ title: 'Erreur', description: getErrorMessage(e), color: 'error' })
  } finally {
    isDeletingCalf.value = null
  }
}

// Bull options for select
const bullOptions = computed(() =>
  bulls.value.map(b => ({ label: b.name, value: b.id }))
)
</script>

<template>
  <UContainer class="py-10 max-w-3xl">
    <!-- Header with breadcrumb -->
    <div class="flex items-center gap-3 mb-2">
      <NuxtLink
        v-if="cow"
        :to="`/pens/${cow.pen.id}`"
        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <UIcon name="i-lucide-arrow-left" class="size-5" />
      </NuxtLink>
      <div class="flex-1 min-w-0">
        <p v-if="cow" class="text-xs text-gray-400 mb-0.5 truncate">
          <NuxtLink :to="`/locations/${cow.pen.building.location.id}`" class="hover:underline">
            {{ cow.pen.building.location.name }}
          </NuxtLink>
          ›
          <NuxtLink :to="`/buildings/${cow.pen.building.id}`" class="hover:underline">
            {{ cow.pen.building.name }}
          </NuxtLink>
          ›
          <NuxtLink :to="`/pens/${cow.pen.id}`" class="hover:underline">
            {{ cow.pen.name }}
          </NuxtLink>
        </p>
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold">🐄 {{ cow?.officialId ?? '…' }}</h1>
          <UBadge
            :color="cow?.prophylaxis ? 'success' : 'neutral'"
            variant="subtle"
            class="cursor-pointer"
            @click="toggleProphylaxis"
          >
            <UIcon
              :name="cow?.prophylaxis ? 'i-lucide-shield-check' : 'i-lucide-shield'"
              class="size-3 mr-1"
            />
            {{ cow?.prophylaxis ? 'Prophylaxie ✓' : 'Prophylaxie' }}
          </UBadge>
        </div>
      </div>
    </div>

    <div v-if="status === 'pending'" class="mt-10 space-y-4">
      <div v-for="i in 3" :key="i" class="h-24 rounded-xl animate-pulse bg-gray-100 dark:bg-gray-800" />
    </div>

    <template v-else-if="cow">
      <!-- Saillies -->
      <section class="mt-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">🐂 Saillies</h2>
          <UButton size="sm" icon="i-lucide-plus" @click="openBreedingModal">
            Ajouter
          </UButton>
        </div>

        <div v-if="!cow.breedings.length" class="text-sm text-gray-400 dark:text-gray-500 italic py-4 text-center">
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
                  🐂 {{ breeding.bull?.name ?? breeding.bullName ?? 'Taureau inconnu' }}
                </span>
                <UBadge v-if="breeding.isMaybe" color="warning" variant="subtle" size="sm">
                  Peut-être ?
                </UBadge>
              </div>
              <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(breeding.date) }}</p>
            </div>
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="sm"
              :loading="isDeletingBreeding === breeding.id"
              @click="deleteBreeding(breeding.id)"
            />
          </li>
        </ul>
      </section>

      <!-- Veaux -->
      <section class="mt-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">🐃 Veaux</h2>
          <UButton size="sm" icon="i-lucide-plus" @click="openCalfModal">
            Ajouter
          </UButton>
        </div>

        <div v-if="!cow.calves.length" class="text-sm text-gray-400 dark:text-gray-500 italic py-4 text-center">
          Aucun veau enregistré
        </div>
        <ul v-else class="space-y-2">
          <li
            v-for="calf in cow.calves"
            :key="calf.id"
            class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-medium text-sm">
                  {{ calf.sex === 'M' ? '♂ Mâle' : '♀ Femelle' }}
                </span>
                <UBadge
                  :color="calf.sex === 'M' ? 'primary' : 'error'"
                  variant="subtle"
                  size="sm"
                >
                  {{ calf.sex }}
                </UBadge>
              </div>
              <p class="text-xs text-gray-400 mt-0.5">Né(e) le {{ formatDate(calf.birthDate) }}</p>
            </div>
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="sm"
              :loading="isDeletingCalf === calf.id"
              @click="deleteCalf(calf.id)"
            />
          </li>
        </ul>
      </section>

      <!-- Notes / Commentaires -->
      <section class="mt-8">
        <h2 class="text-lg font-semibold mb-4">📝 Commentaires</h2>

        <!-- Add note form -->
        <div class="flex gap-2 mb-4">
          <UInput
            v-model="noteContent"
            placeholder="Ajouter un commentaire…"
            class="flex-1"
            @keydown.enter="addNote"
          />
          <UButton
            icon="i-lucide-send"
            :loading="isAddingNote"
            :disabled="!noteContent.trim()"
            @click="addNote"
          />
        </div>

        <div v-if="!cow.notes.length" class="text-sm text-gray-400 dark:text-gray-500 italic py-2">
          Aucun commentaire
        </div>
        <ul v-else class="space-y-2">
          <li
            v-for="note in cow.notes"
            :key="note.id"
            class="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800"
          >
            <div class="flex-1 min-w-0">
              <p class="text-sm">{{ note.content }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ formatDate(note.createdAt) }}</p>
            </div>
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="sm"
              :loading="isDeletingNote === note.id"
              @click="deleteNote(note)"
            />
          </li>
        </ul>
      </section>
    </template>

    <!-- Saillie modal -->
    <UModal v-model:open="isBreedingOpen" title="Enregistrer une saillie">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Date">
            <UInput v-model="breedingDate" type="date" class="w-full" />
          </UFormField>

          <UFormField label="Taureau">
            <div class="space-y-3">
              <div class="flex gap-2">
                <UButton
                  :color="breedingBullType === 'existing' ? 'primary' : 'neutral'"
                  :variant="breedingBullType === 'existing' ? 'solid' : 'outline'"
                  size="sm"
                  @click="breedingBullType = 'existing'"
                >
                  De la liste
                </UButton>
                <UButton
                  :color="breedingBullType === 'external' ? 'primary' : 'neutral'"
                  :variant="breedingBullType === 'external' ? 'solid' : 'outline'"
                  size="sm"
                  @click="breedingBullType = 'external'"
                >
                  Taureau externe
                </UButton>
              </div>

              <USelect
                v-if="breedingBullType === 'existing'"
                v-model="breedingBullId"
                :items="bullOptions"
                class="w-full"
                placeholder="Choisir un taureau"
              />
              <UInput
                v-else
                v-model="breedingBullName"
                placeholder="Nom du taureau externe"
                class="w-full"
              />
            </div>
          </UFormField>

          <UFormField>
            <UCheckbox v-model="breedingIsMaybe" label="Résultat incertain (peut-être ?)" />
          </UFormField>

          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" @click="isBreedingOpen = false">Annuler</UButton>
            <UButton
              :loading="isAddingBreeding"
              :disabled="breedingBullType === 'existing' ? !breedingBullId : !breedingBullName.trim()"
              @click="addBreeding"
            >
              Enregistrer
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Veau modal -->
    <UModal v-model:open="isCalfOpen" title="Ajouter un veau">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Sexe" required>
            <div class="flex gap-2">
              <UButton
                :color="calfSex === 'M' ? 'primary' : 'neutral'"
                :variant="calfSex === 'M' ? 'solid' : 'outline'"
                @click="calfSex = 'M'"
              >
                ♂ Mâle
              </UButton>
              <UButton
                :color="calfSex === 'F' ? 'error' : 'neutral'"
                :variant="calfSex === 'F' ? 'solid' : 'outline'"
                @click="calfSex = 'F'"
              >
                ♀ Femelle
              </UButton>
            </div>
          </UFormField>

          <UFormField label="Date de naissance">
            <UInput v-model="calfBirthDate" type="date" class="w-full" />
          </UFormField>

          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" @click="isCalfOpen = false">Annuler</UButton>
            <UButton :loading="isAddingCalf" @click="addCalf">Ajouter</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </UContainer>
</template>
