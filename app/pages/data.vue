<script setup lang="ts">
useHead({ title: 'Données' })
</script>

<template>
  <UContainer class="py-10 max-w-4xl">
    <div class="flex items-center gap-3 mb-8">
      <UButton
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        to="/"
      />
      <div>
        <h1 class="text-2xl font-bold">Données</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Importer et exporter vos données
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
      <NuxtLink to="/backup" class="group sm:col-span-2">
        <UCard
          class="h-full transition-all group-hover:shadow-md cursor-pointer"
        >
          <div class="flex items-center gap-4">
            <div
              class="p-3 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center"
            >
              <UIcon name="i-lucide-database" class="size-8 text-violet-500" />
            </div>
            <div class="flex-1">
              <h2 class="text-lg font-bold">Sauvegarde complète</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Tout exporter en un fichier JSON · Tout restaurer depuis ce
                fichier
              </p>
            </div>
            <UBadge color="secondary" variant="subtle">Accéder →</UBadge>
          </div>
        </UCard>
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <NuxtLink to="/export" class="group">
        <UCard
          class="h-full transition-all group-hover:shadow-md cursor-pointer"
        >
          <div class="flex items-center gap-4">
            <div
              class="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center"
            >
              <UIcon name="i-lucide-download" class="size-8 text-emerald-500" />
            </div>
            <div>
              <h2 class="text-lg font-bold">Export</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                CSV, Excel, PDF — Vaches, Taureaux, Veaux, Inséminations
              </p>
            </div>
          </div>
          <div class="mt-4">
            <UBadge color="success" variant="subtle">Exporter →</UBadge>
          </div>
        </UCard>
      </NuxtLink>

      <NuxtLink to="/import" class="group">
        <UCard
          class="h-full transition-all group-hover:shadow-md cursor-pointer"
        >
          <div class="flex items-center gap-4">
            <div
              class="p-3 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 flex items-center justify-center"
            >
              <UIcon name="i-lucide-upload" class="size-8 text-sky-500" />
            </div>
            <div>
              <h2 class="text-lg font-bold">Import</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                CSV, Excel — Vaches, Taureaux, Veaux, IA
              </p>
            </div>
          </div>
          <div class="mt-4">
            <UBadge color="info" variant="subtle">Importer →</UBadge>
          </div>
        </UCard>
      </NuxtLink>
    </div>
  </UContainer>
</template>
