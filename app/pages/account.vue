<script setup lang="ts">
const { user, fetch: refreshSession } = useUserSession()
const toast = useToast()

// --- Nom d'exploitation ---
const farmName = ref(user.value?.farmName ?? '')
const farmNameLoading = ref(false)
const farmNameError = ref('')

async function updateFarmName() {
  farmNameError.value = ''
  if (!farmName.value.trim()) {
    farmNameError.value = "Le nom d'exploitation est requis"
    return
  }
  farmNameLoading.value = true
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
    farmNameLoading.value = false
  }
}

// --- Mot de passe ---
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordLoading = ref(false)
const passwordError = ref('')

const passwordMismatch = computed(
  () =>
    confirmPassword.value.length > 0 &&
    newPassword.value !== confirmPassword.value
)
const passwordTooShort = computed(
  () => newPassword.value.length > 0 && newPassword.value.length < 8
)

async function updatePassword() {
  passwordError.value = ''
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    passwordError.value = 'Tous les champs sont requis'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Les mots de passe ne correspondent pas'
    return
  }
  if (newPassword.value.length < 8) {
    passwordError.value = 'Le mot de passe doit contenir au moins 8 caractères'
    return
  }
  passwordLoading.value = true
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
    passwordLoading.value = false
  }
}
</script>

<template>
  <UContainer class="py-16 max-w-lg">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-10">
      <UButton
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        to="/"
      />
      <div>
        <h1 class="text-2xl font-bold">Mon compte</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ user?.username }}
        </p>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <!-- Nom d'exploitation -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-tractor" class="size-4 text-primary" />
            <h2 class="font-semibold">Nom d'exploitation</h2>
          </div>
        </template>

        <form class="flex flex-col gap-4" @submit.prevent="updateFarmName">
          <UFormField label="Nom de l'exploitation" :error="farmNameError || undefined">
            <UInput
              v-model="farmName"
              placeholder="Mon exploitation"
              :disabled="farmNameLoading"
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
              :loading="farmNameLoading"
              :disabled="farmName.trim() === user?.farmName"
            />
          </div>
        </form>
      </UCard>

      <!-- Mot de passe -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-lock" class="size-4 text-primary" />
            <h2 class="font-semibold">Mot de passe</h2>
          </div>
        </template>

        <form class="flex flex-col gap-4" @submit.prevent="updatePassword">
          <UFormField label="Mot de passe actuel" :error="passwordError || undefined">
            <UInput
              v-model="currentPassword"
              type="password"
              placeholder="••••••••"
              :disabled="passwordLoading"
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
              :disabled="passwordLoading"
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
              :disabled="passwordLoading"
              autocomplete="new-password"
              class="w-full"
            />
          </UFormField>

          <div class="flex justify-end">
            <UButton
              type="submit"
              label="Changer le mot de passe"
              :loading="passwordLoading"
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
    </div>
  </UContainer>
</template>
