<script lang="ts" setup>
import type { BullDetail } from '~~/types'

defineProps<{
  breedings: BullDetail['breedings']
}>()

const GESTATION_DAYS = 280

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function expectedCalving(dateStr: string): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + GESTATION_DAYS)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}
</script>

<template>
  <section>
    <h2 class="text-lg font-semibold mb-4">📅 Historique des saillies</h2>

    <div
      v-if="!breedings.length"
      class="text-sm text-gray-400 dark:text-gray-500 italic py-4 text-center"
    >
      Aucune saillie enregistrée
    </div>
    <ul v-else class="space-y-2">
      <li
        v-for="breeding in breedings"
        :key="breeding.id"
        class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-medium text-sm">
              🐄
              <NuxtLink
                :to="`/cows/${breeding.cow.id}`"
                class="hover:underline"
              >
                {{ breeding.cow.officialId }}
              </NuxtLink>
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
          <p class="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
            Vêlage prévu : {{ expectedCalving(breeding.date) }}
          </p>
        </div>
      </li>
    </ul>
  </section>
</template>
