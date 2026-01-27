<script setup>
const isOpen = ref(false)
const { data: bulls, refresh } = await useFetch('/api/bulls')
const newBull = ref({ name: '', comment: '' })

const columns = [
  { key: 'name', label: 'Nom', id: 'name' },
  { key: 'createdAt', label: 'Ajouté le', id: 'createdAt' },
  { key: 'actions', label: 'Actions', id: 'actions' }
]

const saveBull = async () => {
  try {
    await $fetch('/api/bulls', {
      method: 'POST',
      body: newBull.value
    })
    isOpen.value = false
    newBull.value = { name: '', comment: '' }
    refresh()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  }
}
</script>

<template>
  <UContainer class="py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold flex items-center gap-2">
        <UIcon name="i-lucide-shield-check" class="text-primary" />
        Gestion des Taureaux
      </h1>
      <UButton icon="i-lucide-plus" label="Nouveau Taureau" @click="isOpen = true" />
    </div>

    <UTable :rows="bulls" :columns="columns">
      <template #name-data="{ row }">
        <span class="font-bold text-primary">{{ row.name }}</span>
      </template>
      <template #actions-data>
        <UButton color="gray" variant="ghost" icon="i-lucide-eye" />
      </template>
    </UTable>

    <UModal v-model="isOpen">
      <UCard>
        <template #header>Ajouter un reproducteur</template>
        <UFormField label="Nom du taureau" name="name" class="mb-4">
          <UInput v-model="newBull.name" placeholder="Ex: Jupiter" />
        </UFormField>
        <UFormField label="Premier commentaire" name="comment">
          <UTextarea v-model="newBull.comment" />
        </UFormField>
        <template #footer>
          <UButton label="Enregistrer" block @click="saveBull" />
        </template>
      </UCard>
    </UModal>
  </UContainer>
</template>