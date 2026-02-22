<script setup lang="ts">
const { user, fetch: refreshSession } = useUserSession()
const toast = useToast()

const farmName = ref(user.value?.farmName ?? '')
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  error.value = ''
  if (!farmName.value.trim()) {
    error.value = "Le nom d'exploitation est requis"
    return
  }
  loading.value = true
  try {
    await $fetch('/api/auth/account', {
      method: 'PUT',
      body: { farmName: farmName.value.trim() },
    })
    await refreshSession()
    toast.add({ title: "Nom d'exploitation mis à jour", color: 'success' })
  } catch (e) {
    toast.add({
      title: "Erreur lors de la mise à jour du nom d'exploitation",
      description: getErrorMessage(e),
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-tractor" class="size-4 text-primary" />
        <h2 class="font-semibold">Nom d'exploitation</h2>
      </div>
    </template>

    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <UFormField label="Nom de l'exploitation" :error="error || undefined">
        <UInput
          v-model="farmName"
          placeholder="Mon exploitation"
          :disabled="loading"
          class="w-full"
        />
      </UFormField>

      <p class="text-xs text-gray-400 dark:text-gray-500">
        Le nom doit être unique. La mise à jour est refusée s'il est déjà
        utilisé.
      </p>

      <div class="flex justify-end">
        <UButton
          type="submit"
          label="Mettre à jour"
          :loading="loading"
          :disabled="farmName.trim() === user?.farmName"
        />
      </div>
    </form>
  </UCard>
</template>
