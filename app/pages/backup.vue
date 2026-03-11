<script setup lang="ts">
useHead({ title: 'Sauvegarde complète' })

interface BackupData {
  version: number
  exportedAt: string
  bulls: unknown[]
  cows: unknown[]
  breedings: unknown[]
  calves: unknown[]
}

interface RestoreResult {
  bulls: { created: number; skipped: number }
  cows: { created: number; skipped: number }
  breedings: { created: number; skipped: number }
  calves: { created: number; skipped: number }
}

// ── Export ────────────────────────────────────────────────────────────────────

const exporting = ref(false)
const exportError = ref('')

async function downloadBackup() {
  exporting.value = true
  exportError.value = ''
  try {
    const data = await $fetch<BackupData>('/api/v1/backup')
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const date = new Date().toISOString().slice(0, 10)
    a.download = `sauvegarde-cheptel-${date}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    exportError.value = 'Erreur lors de la génération de la sauvegarde'
  } finally {
    exporting.value = false
  }
}

// ── Restore ───────────────────────────────────────────────────────────────────

const fileInput = ref<HTMLInputElement | null>(null)
const parsedBackup = ref<BackupData | null>(null)
const fileName = ref('')
const restoring = ref(false)
const restoreResult = ref<RestoreResult | null>(null)
const restoreError = ref('')

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  if (!f) return
  fileName.value = f.name
  parsedBackup.value = null
  restoreResult.value = null
  restoreError.value = ''

  try {
    const text = await f.text()
    const data = JSON.parse(text) as BackupData
    if (!data.version || !Array.isArray(data.cows)) {
      restoreError.value = 'Fichier de sauvegarde invalide'
      return
    }
    parsedBackup.value = data
  } catch {
    restoreError.value = 'Impossible de lire le fichier JSON'
  }
}

async function confirmRestore() {
  if (!parsedBackup.value) return
  restoring.value = true
  restoreError.value = ''
  try {
    const res = await $fetch<{ success: boolean; data: RestoreResult }>('/api/v1/restore', {
      method: 'POST',
      body: parsedBackup.value,
    })
    restoreResult.value = res.data
    parsedBackup.value = null
    fileName.value = ''
    if (fileInput.value) fileInput.value.value = ''
  } catch (e: unknown) {
    restoreError.value =
      (e as { data?: { message?: string } }).data?.message ?? 'Erreur lors de la restauration'
  } finally {
    restoring.value = false
  }
}

function resetRestore() {
  parsedBackup.value = null
  restoreResult.value = null
  restoreError.value = ''
  fileName.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

const totalCreated = computed(() =>
  restoreResult.value
    ? Object.values(restoreResult.value).reduce((s, v) => s + v.created, 0)
    : 0
)

const sections = [
  { key: 'bulls' as const, label: 'Taureaux', emoji: '🐂' },
  { key: 'cows' as const, label: 'Vaches', emoji: '🐄' },
  { key: 'breedings' as const, label: 'Inséminations', emoji: '💉' },
  { key: 'calves' as const, label: 'Veaux', emoji: '🐮' },
]
</script>

<template>
  <UContainer class="py-10 max-w-2xl">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-8">
      <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" to="/data" />
      <div>
        <h1 class="text-2xl font-bold">Sauvegarde complète</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Exportez ou restaurez toutes vos données en un fichier JSON
        </p>
      </div>
    </div>

    <div class="space-y-4">

      <!-- Export card -->
      <UCard>
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20">
            <UIcon name="i-lucide-database" class="size-7 text-emerald-500" />
          </div>
          <div class="flex-1">
            <h2 class="text-base font-semibold">Tout exporter</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Télécharge un fichier JSON avec vaches, taureaux, inséminations et veaux
            </p>
          </div>
          <UButton
            icon="i-lucide-download"
            color="success"
            :loading="exporting"
            @click="downloadBackup"
          >
            Sauvegarder
          </UButton>
        </div>
        <UAlert
          v-if="exportError"
          color="error"
          variant="subtle"
          icon="i-lucide-alert-circle"
          :description="exportError"
          class="mt-3"
        />
      </UCard>

      <!-- Restore card -->
      <UCard>
        <div class="flex items-center gap-4 mb-4">
          <div class="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-500/20">
            <UIcon name="i-lucide-upload" class="size-7 text-amber-500" />
          </div>
          <div class="flex-1">
            <h2 class="text-base font-semibold">Tout importer</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Restaure depuis un fichier de sauvegarde — les doublons sont ignorés
            </p>
          </div>
        </div>

        <!-- File picker -->
        <template v-if="!parsedBackup && !restoreResult">
          <div
            class="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
            @click="fileInput?.click()"
          >
            <UIcon name="i-lucide-file-json" class="size-8 mx-auto mb-2 text-gray-400" />
            <p class="text-sm text-gray-600 dark:text-gray-400">
              <template v-if="fileName">
                <span class="font-medium text-primary">{{ fileName }}</span>
              </template>
              <template v-else>
                Cliquez pour choisir un fichier JSON
              </template>
            </p>
            <input
              ref="fileInput"
              type="file"
              accept=".json"
              class="hidden"
              @change="onFileChange"
            />
          </div>
        </template>

        <!-- Preview before restore -->
        <template v-if="parsedBackup">
          <div class="rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800 mb-4">
            <div
              v-for="s in sections"
              :key="s.key"
              class="flex items-center justify-between px-4 py-3"
            >
              <span class="text-sm flex items-center gap-2">
                <span>{{ s.emoji }}</span>
                {{ s.label }}
              </span>
              <UBadge color="neutral" variant="subtle">
                {{ (parsedBackup[s.key] as unknown[]).length }} enregistrement(s)
              </UBadge>
            </div>
          </div>
          <div class="text-xs text-gray-400 mb-4">
            Exporté le {{ new Date(parsedBackup.exportedAt).toLocaleDateString('fr-FR') }}
          </div>
          <div class="flex gap-3">
            <UButton
              icon="i-lucide-upload"
              color="warning"
              :loading="restoring"
              @click="confirmRestore"
            >
              Restaurer
            </UButton>
            <UButton variant="ghost" color="neutral" @click="resetRestore">Annuler</UButton>
          </div>
        </template>

        <!-- Results -->
        <template v-if="restoreResult">
          <div class="flex items-center gap-3 mb-4">
            <UIcon name="i-lucide-check-circle" class="size-6 text-success-500" />
            <p class="font-medium">Restauration terminée — {{ totalCreated }} élément(s) importé(s)</p>
          </div>
          <div class="rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800 mb-4">
            <div
              v-for="s in sections"
              :key="s.key"
              class="flex items-center justify-between px-4 py-3 text-sm"
            >
              <span class="flex items-center gap-2">
                <span>{{ s.emoji }}</span>
                {{ s.label }}
              </span>
              <div class="flex gap-2">
                <UBadge v-if="restoreResult[s.key].created" color="success" variant="subtle">
                  +{{ restoreResult[s.key].created }}
                </UBadge>
                <UBadge v-if="restoreResult[s.key].skipped" color="neutral" variant="subtle">
                  {{ restoreResult[s.key].skipped }} ignoré(s)
                </UBadge>
              </div>
            </div>
          </div>
          <UButton variant="outline" color="neutral" size="sm" @click="resetRestore">
            Nouvelle restauration
          </UButton>
        </template>

        <UAlert
          v-if="restoreError"
          color="error"
          variant="subtle"
          icon="i-lucide-alert-circle"
          :description="restoreError"
          class="mt-3"
        />
      </UCard>

    </div>
  </UContainer>
</template>
