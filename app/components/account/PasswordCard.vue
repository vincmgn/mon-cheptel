<script setup lang="ts">
const toast = useToast()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

const passwordMismatch = computed(
  () =>
    confirmPassword.value.length > 0 &&
    newPassword.value !== confirmPassword.value
)
const passwordTooShort = computed(
  () => newPassword.value.length > 0 && newPassword.value.length < 8
)

async function onSubmit() {
  error.value = ''
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    error.value = 'Tous les champs sont requis'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }
  if (newPassword.value.length < 8) {
    error.value = 'Le mot de passe doit contenir au moins 8 caractères'
    return
  }
  loading.value = true
  try {
    await $fetch('/api/auth/account', {
      method: 'PUT',
      body: {
        currentPassword: currentPassword.value,
        newPassword: newPassword.value,
        confirmPassword: confirmPassword.value,
      },
    })
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    toast.add({ title: 'Mot de passe mis à jour', color: 'success' })
  } catch (e) {
    toast.add({
      title: 'Erreur lors de la mise à jour du mot de passe',
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
        <UIcon name="i-lucide-lock" class="size-4 text-primary" />
        <h2 class="font-semibold">Mot de passe</h2>
      </div>
    </template>

    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <UFormField label="Mot de passe actuel" :error="error || undefined">
        <UInput
          v-model="currentPassword"
          type="password"
          placeholder="••••••••"
          :disabled="loading"
          autocomplete="current-password"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Nouveau mot de passe"
        :error="passwordTooShort ? 'Minimum 8 caractères' : undefined"
      >
        <UInput
          v-model="newPassword"
          type="password"
          placeholder="••••••••"
          :disabled="loading"
          autocomplete="new-password"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Confirmer le nouveau mot de passe"
        :error="passwordMismatch ? 'Les mots de passe ne correspondent pas' : undefined"
      >
        <UInput
          v-model="confirmPassword"
          type="password"
          placeholder="••••••••"
          :disabled="loading"
          autocomplete="new-password"
          class="w-full"
        />
      </UFormField>

      <div class="flex justify-end">
        <UButton
          type="submit"
          label="Changer le mot de passe"
          :loading="loading"
          :disabled="
            !currentPassword ||
            !newPassword ||
            !confirmPassword ||
            passwordMismatch ||
            passwordTooShort
          "
        />
      </div>
    </form>
  </UCard>
</template>
