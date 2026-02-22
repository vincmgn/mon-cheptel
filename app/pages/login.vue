<script setup lang="ts">
import { z } from 'zod'

definePageMeta({ layout: false })

const schema = z.object({
  username: z.string().min(4, 'Au moins 4 caractères'),
  password: z.string().min(4, 'Au moins 4 caractères'),
})

const fields = [
  {
    name: 'username',
    type: 'text',
    label: 'Nom d\'utilisateur',
    placeholder: 'votre-identifiant',
  },
  {
    name: 'password',
    type: 'password',
    label: 'Mot de passe',
    placeholder: '••••••••',
  },
]

const error = ref<string | null>(null)
const { fetch: refreshSession } = useUserSession()

async function onSubmit(event: { data: { username: string; password: string } }) {
  error.value = null
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: event.data,
    })
    await refreshSession()
    await navigateTo('/')
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err?.data?.message ?? 'Erreur de connexion'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <UIcon name="i-lucide-beef" class="size-12 text-primary mx-auto mb-3" />
        <h1 class="text-2xl font-bold">Mon Cheptel</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestion de votre élevage</p>
      </div>

      <UAuthForm
        title="Connexion"
        :fields="fields"
        :schema="schema"
        :submit="{ label: 'Se connecter' }"
        @submit="onSubmit"
      >
        <template #description>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Pas encore de compte ?
            <NuxtLink to="/register" class="text-primary font-medium hover:underline">
              Créer un compte
            </NuxtLink>
          </p>
        </template>
        <template #footer>
          <UAlert
            v-if="error"
            color="error"
            variant="soft"
            :description="error"
            icon="i-lucide-circle-alert"
          />
        </template>
      </UAuthForm>
    </div>
  </div>
</template>
