<script setup lang="ts">
import type { ApiResponse, BullDetail, Note } from '~~/types'
import { getErrorMessage } from '~/utils/error'

const route = useRoute()
const router = useRouter()
const id = parseInt(route.params.id as string)
const toast = useToast()

const { data, refresh, status } = await useFetch<ApiResponse<BullDetail>>(
  `/api/v1/bulls/${id}`
)
const bull = computed(() => data.value?.data)

watchEffect(() => {
  if (status.value === 'success' && !bull.value) router.replace('/bulls')
})

// ---- Edit name ----
const isEditOpen = ref(false)
const editName = ref('')
const isEditing = ref(false)

function openEdit() {
  editName.value = bull.value?.name ?? ''
  isEditOpen.value = true
}

async function saveEdit() {
  isEditing.value = true
  try {
    await $fetch(`/api/v1/bulls/${id}`, {
      method: 'PUT',
      body: { name: editName.value.trim() },
    })
    toast.add({ title: 'Nom modifié', color: 'success' })
    isEditOpen.value = false
    await refresh()
  } catch (e) {
    toast.add({ title: 'Erreur', description: getErrorMessage(e), color: 'error' })
  } finally {
    isEditing.value = false
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
      body: { content: noteContent.value.trim(), bullId: id },
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <UContainer class="py-10 max-w-3xl">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-2">
      <NuxtLink
        to="/bulls"
        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <UIcon name="i-lucide-arrow-left" class="size-5" />
      </NuxtLink>
      <div class="flex-1">
        <p class="text-xs text-gray-400 mb-0.5">Taureaux</p>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold">🐂 {{ bull?.name ?? '…' }}</h1>
          <UButton
            icon="i-lucide-pencil"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="openEdit"
          />
        </div>
      </div>
    </div>

    <div v-if="status === 'pending'" class="mt-10 space-y-4">
      <div v-for="i in 3" :key="i" class="h-24 rounded-xl animate-pulse bg-gray-100 dark:bg-gray-800" />
    </div>

    <template v-else-if="bull">
      <!-- Historique des saillies -->
      <section class="mt-8">
        <h2 class="text-lg font-semibold mb-4">📅 Historique des saillies</h2>

        <div v-if="!bull.breedings.length" class="text-sm text-gray-400 dark:text-gray-500 italic py-4 text-center">
          Aucune saillie enregistrée
        </div>
        <ul v-else class="space-y-2">
          <li
            v-for="breeding in bull.breedings"
            :key="breeding.id"
            class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-medium text-sm">
                  🐄
                  <NuxtLink :to="`/cows/${breeding.cow.id}`" class="hover:underline">
                    {{ breeding.cow.officialId }}
                  </NuxtLink>
                </span>
                <UBadge v-if="breeding.isMaybe" color="warning" variant="subtle" size="sm">
                  Peut-être ?
                </UBadge>
              </div>
              <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(breeding.date) }}</p>
            </div>
          </li>
        </ul>
      </section>

      <!-- Notes -->
      <section class="mt-8">
        <h2 class="text-lg font-semibold mb-4">📝 Commentaires</h2>

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

        <div v-if="!bull.notes.length" class="text-sm text-gray-400 dark:text-gray-500 italic py-2">
          Aucun commentaire
        </div>
        <ul v-else class="space-y-2">
          <li
            v-for="note in bull.notes"
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

    <!-- Edit name modal -->
    <UModal v-model:open="isEditOpen" title="Modifier le nom">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Nom" required>
            <UInput v-model="editName" class="w-full" />
          </UFormField>
          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="outline" @click="isEditOpen = false">Annuler</UButton>
            <UButton :loading="isEditing" :disabled="!editName.trim()" @click="saveEdit">Enregistrer</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </UContainer>
</template>
