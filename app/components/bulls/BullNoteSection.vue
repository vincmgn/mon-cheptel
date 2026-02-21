<script lang="ts" setup>
import type { Note } from '~~/types'
import { getErrorMessage } from '~/utils/error'

const props = defineProps<{
  notes: Note[]
  bullId: number
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const toast = useToast()
const content = ref('')
const isAdding = ref(false)
const isDeletingId = ref<number | null>(null)

async function addNote() {
  if (!content.value.trim()) return
  isAdding.value = true
  try {
    await $fetch('/api/v1/notes', {
      method: 'POST',
      body: { content: content.value.trim(), bullId: props.bullId },
    })
    content.value = ''
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

async function deleteNote(note: Note) {
  isDeletingId.value = note.id
  try {
    await $fetch(`/api/v1/notes/${note.id}`, { method: 'DELETE' })
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
    <h2 class="text-lg font-semibold mb-4">📝 Commentaires</h2>

    <div class="flex gap-2 mb-4">
      <UInput
        v-model="content"
        placeholder="Ajouter un commentaire…"
        class="flex-1"
        @keydown.enter="addNote"
      />
      <UButton
        icon="i-lucide-send"
        :loading="isAdding"
        :disabled="!content.trim()"
        @click="addNote"
      />
    </div>

    <div
      v-if="!notes.length"
      class="text-sm text-gray-400 dark:text-gray-500 italic py-2"
    >
      Aucun commentaire
    </div>
    <ul v-else class="space-y-2">
      <li
        v-for="note in notes"
        :key="note.id"
        class="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800"
      >
        <div class="flex-1 min-w-0">
          <p class="text-sm">{{ note.content }}</p>
          <p class="text-xs text-gray-400 mt-1">
            {{ formatDate(note.createdAt) }}
          </p>
        </div>
        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          size="sm"
          :loading="isDeletingId === note.id"
          @click="deleteNote(note)"
        />
      </li>
    </ul>
  </section>
</template>
