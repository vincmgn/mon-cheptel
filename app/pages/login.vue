<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import HeadApp from '~/components/index/HeadApp.vue'

definePageMeta({ layout: false })

const schema = z.object({
  username: z
    .string()
    .optional()
    .refine(val => !val || val.length >= 4, 'Au moins 4 caractères'),
  password: z
    .string()
    .optional()
    .refine(val => !val || val.length >= 4, 'Au moins 4 caractères'),
})

const fields = [
  {
    name: 'username',
    type: 'text',
    label: "Nom d'utilisateur",
    placeholder: 'votre-identifiant',
  },
  {
    name: 'password',
    type: 'password',
    label: 'Mot de passe',
    placeholder: '••••••••',
  },
]

const { fetch: refreshSession } = useUserSession()
const toast = useToast()
const formKey = ref(0)

type Schema = z.output<typeof schema>

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: event.data,
    })
    await refreshSession()
    await navigateTo('/')
  } catch (e) {
    formKey.value++
    toast.add({
      title: 'Erreur de connexion',
      description: getErrorMessage(e),
      color: 'error',
    })
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4"
  >
    <div class="w-full max-w-sm">
      <HeadApp />

      <UAuthForm
        :key="formKey"
        title="Connexion"
        :fields="fields"
        :schema="schema"
        :submit="{ label: 'Se connecter' }"
        @submit="onSubmit"
      >
        <template #description>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Pas encore de compte ?
            <NuxtLink
              to="/register"
              class="text-primary font-medium hover:underline"
            >
              Créer un compte
            </NuxtLink>
          </p>
        </template>
      </UAuthForm>
    </div>
  </div>
</template>
