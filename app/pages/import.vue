<script setup lang="ts">
useHead({ title: "Import de données" })

type ImportType = 'cows' | 'bulls' | 'breedings' | 'calves'

interface ColumnDef {
  label: string
  required: boolean
}

const typeOptions: { value: ImportType; label: string; emoji: string }[] = [
  { value: 'cows', label: 'Vaches', emoji: '🐄' },
  { value: 'bulls', label: 'Taureaux', emoji: '🐂' },
  { value: 'calves', label: 'Veaux', emoji: '🐮' },
  { value: 'breedings', label: 'Inséminations', emoji: '💉' },
]

const expectedColumns: Record<ImportType, ColumnDef[]> = {
  cows: [
    { label: 'N°', required: true },
    { label: 'Lieu', required: true },
    { label: 'Bâtiment', required: true },
    { label: 'Case', required: true },
    { label: 'Prophylaxie', required: false },
    { label: "Date d'entrée", required: false },
  ],
  bulls: [
    { label: 'Nom', required: true },
    { label: "Date d'ajout", required: false },
  ],
  breedings: [
    { label: "Date d'insémination", required: true },
    { label: 'Vache (N°)', required: true },
    { label: 'Taureau', required: false },
    { label: 'Statut', required: false },
  ],
  calves: [
    { label: 'N°', required: false },
    { label: 'Sexe', required: true },
    { label: 'Date de naissance', required: true },
    { label: 'Mère (N°)', required: true },
  ],
}

// Maps normalized column header → field key
const columnMap: Record<ImportType, Record<string, string>> = {
  cows: {
    'n°': 'officialId',
    'n': 'officialId',
    'numero': 'officialId',
    'numéro': 'officialId',
    'officialid': 'officialId',
    'lieu': 'location',
    'location': 'location',
    'bâtiment': 'building',
    'batiment': 'building',
    'building': 'building',
    'case': 'pen',
    'pen': 'pen',
    'prophylaxie': 'prophylaxis',
    'prophylaxis': 'prophylaxis',
    "date d'entrée": 'createdAt',
    "date d'entree": 'createdAt',
    'createdat': 'createdAt',
  },
  bulls: {
    'nom': 'name',
    'name': 'name',
    "date d'ajout": 'createdAt',
    'createdat': 'createdAt',
  },
  breedings: {
    "date d'insémination": 'date',
    "date d'insemination": 'date',
    'date': 'date',
    'vache (n°)': 'cowOfficialId',
    'vache': 'cowOfficialId',
    'cowofficialid': 'cowOfficialId',
    'taureau': 'bullName',
    'bullname': 'bullName',
    'statut': 'isMaybe',
    'ismayb': 'isMaybe',
  },
  calves: {
    'n°': 'officialId',
    'officialid': 'officialId',
    'sexe': 'sex',
    'sex': 'sex',
    'date de naissance': 'birthDate',
    'birthdate': 'birthDate',
    'mère (n°)': 'motherOfficialId',
    'mere (n°)': 'motherOfficialId',
    'mère': 'motherOfficialId',
    'mere': 'motherOfficialId',
    'motherofficialid': 'motherOfficialId',
  },
}

const statusConfig: Record<string, { color: 'success' | 'warning' | 'error'; label: string }> = {
  ok: { color: 'success', label: 'OK' },
  duplicate: { color: 'warning', label: 'Doublon' },
  penNotFound: { color: 'error', label: 'Case introuvable' },
  cowNotFound: { color: 'error', label: 'Vache introuvable' },
  motherNotFound: { color: 'error', label: 'Mère introuvable' },
  missingField: { color: 'error', label: 'Champ manquant' },
  invalidSex: { color: 'error', label: 'Sexe invalide' },
}

// ── State ────────────────────────────────────────────────────────────────────

const importType = ref<ImportType>('cows')
const fileInput = ref<HTMLInputElement | null>(null)
const fileName = ref('')
const parsedRows = ref<Record<string, string>[]>([])
const previewRows = ref<(Record<string, string> & { status: string; message?: string })[]>([])
const step = ref<'upload' | 'preview' | 'done'>('upload')
const previewing = ref(false)
const importing = ref(false)
const importResult = ref<{ created: number; skipped: number } | null>(null)
const errorMsg = ref('')

watch(importType, () => {
  fileName.value = ''
  parsedRows.value = []
  previewRows.value = []
  step.value = 'upload'
  errorMsg.value = ''
  importResult.value = null
  if (fileInput.value) fileInput.value.value = ''
})

// ── Computed ─────────────────────────────────────────────────────────────────

const okRows = computed(() => previewRows.value.filter(r => r.status === 'ok'))
const errorRows = computed(() => previewRows.value.filter(r => r.status !== 'ok'))

const previewColumns = computed(() =>
  expectedColumns[importType.value].map(c => c.label)
)

// ── File parsing ─────────────────────────────────────────────────────────────

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  if (!f) return
  fileName.value = f.name
  parsedRows.value = []
  previewRows.value = []
  step.value = 'upload'
  errorMsg.value = ''
  importResult.value = null

  try {
    const XLSX = await import('xlsx')
    const buf = await f.arrayBuffer()
    const wb = XLSX.read(buf, { type: 'array', codepage: 65001, FS: ';' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
      raw: false,
      defval: '',
    })

    const map = columnMap[importType.value]
    const mapped = raw
      .map(row => {
        const out: Record<string, string> = {}
        for (const [col, val] of Object.entries(row)) {
          const key = map[col.trim().toLowerCase()] ?? col.trim()
          out[key] = String(val ?? '').trim()
        }
        return out
      })
      .filter(row => Object.values(row).some(v => v !== ''))

    if (!mapped.length) {
      errorMsg.value = 'Aucune ligne trouvée dans le fichier'
      return
    }

    parsedRows.value = mapped
    await loadPreview()
  } catch {
    errorMsg.value = 'Impossible de lire le fichier. Vérifiez le format (CSV ou Excel).'
  }
}

async function loadPreview() {
  previewing.value = true
  errorMsg.value = ''
  try {
    const res = await $fetch<{ success: boolean; data: typeof previewRows.value }>(
      '/api/v1/import/preview',
      { method: 'POST', body: { type: importType.value, rows: parsedRows.value } }
    )
    previewRows.value = res.data
    step.value = 'preview'
  } catch (e: unknown) {
    errorMsg.value =
      (e as { data?: { message?: string } }).data?.message ?? 'Erreur lors de la validation'
  } finally {
    previewing.value = false
  }
}

async function confirmImport() {
  importing.value = true
  errorMsg.value = ''
  try {
    const res = await $fetch<{ success: boolean; data: { created: number; skipped: number } }>(
      '/api/v1/import/confirm',
      { method: 'POST', body: { type: importType.value, rows: parsedRows.value } }
    )
    importResult.value = res.data
    step.value = 'done'
  } catch (e: unknown) {
    errorMsg.value =
      (e as { data?: { message?: string } }).data?.message ?? "Erreur lors de l'import"
  } finally {
    importing.value = false
  }
}

function reset() {
  fileName.value = ''
  parsedRows.value = []
  previewRows.value = []
  step.value = 'upload'
  errorMsg.value = ''
  importResult.value = null
  if (fileInput.value) fileInput.value.value = ''
}

// ── Template CSV download ─────────────────────────────────────────────────────

function downloadTemplate() {
  const cols = expectedColumns[importType.value]
  const header = cols.map(c => c.label).join(';')
  const blob = new Blob(['\ufeff' + header + '\n'], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `modele_import_${importType.value}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── Cell value resolver (for preview table) ───────────────────────────────────

function getCellValue(row: Record<string, string>, colLabel: string): string {
  const map = columnMap[importType.value]
  const key = map[colLabel.toLowerCase()] ?? colLabel
  return row[key] ?? ''
}
</script>

<template>
  <UContainer class="py-10 max-w-4xl">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-8">
      <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" to="/data" />
      <div>
        <h1 class="text-2xl font-bold">Import de données</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Importez vos données depuis un fichier CSV ou Excel
        </p>
      </div>
    </div>

    <UCard class="space-y-8">
      <!-- Step 1: Type -->
      <div>
        <p class="text-md font-semibold text-gray-400 uppercase tracking-wider mb-3">
          1. Type de données
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            v-for="opt in typeOptions"
            :key="opt.value"
            class="flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 text-sm font-medium transition-all cursor-pointer"
            :class="
              importType === opt.value
                ? 'border-primary bg-primary/5 text-primary dark:bg-primary/10'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
            "
            @click="importType = opt.value as ImportType"
          >
            <span class="text-lg leading-none">{{ opt.emoji }}</span>
            {{ opt.label }}
          </button>
        </div>

        <!-- Order hint for breedings/calves -->
        <UAlert
          v-if="importType === 'breedings'"
          color="info"
          variant="subtle"
          icon="i-lucide-info"
          description="Les vaches et taureaux référencés doivent déjà exister dans l'application."
          class="mt-3"
        />
        <UAlert
          v-if="importType === 'calves'"
          color="info"
          variant="subtle"
          icon="i-lucide-info"
          description="Les vaches mères référencées doivent déjà exister dans l'application."
          class="mt-3"
        />
      </div>

      <!-- Step 2: File -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <p class="text-md font-semibold text-gray-400 uppercase tracking-wider">
            2. Fichier CSV ou Excel
          </p>
          <UButton
            variant="ghost"
            size="xs"
            color="neutral"
            icon="i-lucide-download"
            @click="downloadTemplate"
          >
            Télécharger le modèle
          </UButton>
        </div>

        <!-- Expected columns hint -->
        <div class="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm">
          <p class="text-gray-500 dark:text-gray-400 mb-2">Colonnes attendues :</p>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="col in expectedColumns[importType]"
              :key="col.label"
              :color="col.required ? 'primary' : 'neutral'"
              variant="subtle"
            >
              {{ col.label }}{{ col.required ? '' : ' (optionnel)' }}
            </UBadge>
          </div>
          <p class="text-xs text-gray-400 mt-2">
            Séparateur CSV : point-virgule (;) · Dates : jj/mm/aaaa ou aaaa-mm-jj
          </p>
        </div>

        <!-- File input -->
        <div
          class="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
          @click="fileInput?.click()"
        >
          <UIcon name="i-lucide-upload" class="size-8 mx-auto mb-2 text-gray-400" />
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <template v-if="fileName">
              <span class="font-medium text-primary">{{ fileName }}</span>
            </template>
            <template v-else>
              Cliquez pour choisir un fichier
              <span class="text-gray-400">(CSV ou .xlsx)</span>
            </template>
          </p>
          <input
            ref="fileInput"
            type="file"
            accept=".csv,.xlsx,.xls"
            class="hidden"
            @change="onFileChange"
          />
        </div>

        <!-- Error -->
        <UAlert
          v-if="errorMsg"
          color="error"
          variant="subtle"
          icon="i-lucide-alert-circle"
          :description="errorMsg"
          class="mt-3"
        />

        <!-- Loading -->
        <div v-if="previewing" class="mt-4 space-y-2">
          <div
            v-for="i in 4"
            :key="i"
            class="h-10 rounded-lg animate-pulse bg-gray-100 dark:bg-gray-800"
          />
        </div>
      </div>

      <!-- Step 3: Preview -->
      <template v-if="step === 'preview' && previewRows.length">
        <div>
          <div class="flex items-center justify-between mb-3">
            <p class="text-md font-semibold text-gray-400 uppercase tracking-wider">
              3. Vérification
            </p>
            <div class="flex gap-2">
              <UBadge v-if="okRows.length" color="success" variant="subtle">
                {{ okRows.length }} à importer
              </UBadge>
              <UBadge v-if="errorRows.length" color="error" variant="subtle">
                {{ errorRows.length }} ignorée(s)
              </UBadge>
            </div>
          </div>

          <!-- Preview table -->
          <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    v-for="col in previewColumns"
                    :key="col"
                    class="text-left px-3 py-2.5 font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap border-b border-gray-200 dark:border-gray-700"
                  >
                    {{ col }}
                  </th>
                  <th
                    class="text-left px-3 py-2.5 font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap border-b border-gray-200 dark:border-gray-700"
                  >
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, i) in previewRows"
                  :key="i"
                  class="border-b border-gray-100 dark:border-gray-800 last:border-0"
                  :class="row.status !== 'ok' ? 'opacity-50' : ''"
                >
                  <td
                    v-for="col in previewColumns"
                    :key="col"
                    class="px-3 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap"
                  >
                    {{ getCellValue(row, col) }}
                  </td>
                  <td class="px-3 py-2 whitespace-nowrap">
                    <UTooltip v-if="row.message" :text="row.message">
                      <UBadge
                        :color="statusConfig[row.status]?.color ?? 'neutral'"
                        variant="subtle"
                        size="sm"
                      >
                        {{ statusConfig[row.status]?.label ?? row.status }}
                      </UBadge>
                    </UTooltip>
                    <UBadge
                      v-else
                      :color="statusConfig[row.status]?.color ?? 'neutral'"
                      variant="subtle"
                      size="sm"
                    >
                      {{ statusConfig[row.status]?.label ?? row.status }}
                    </UBadge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Confirm -->
          <div class="flex gap-3 mt-4">
            <UButton
              icon="i-lucide-upload"
              :disabled="!okRows.length || importing"
              :loading="importing"
              @click="confirmImport"
            >
              Importer {{ okRows.length }} ligne(s)
            </UButton>
            <UButton variant="ghost" color="neutral" @click="reset">Annuler</UButton>
          </div>
        </div>
      </template>

      <!-- Step 4: Done -->
      <template v-if="step === 'done' && importResult">
        <div class="text-center py-8">
          <UIcon name="i-lucide-check-circle" class="size-12 mx-auto mb-3 text-success-500" />
          <h2 class="text-lg font-semibold mb-1">Import terminé</h2>
          <p class="text-gray-500 dark:text-gray-400 text-sm">
            <strong>{{ importResult.created }}</strong> ligne(s) importée(s) ·
            <strong>{{ importResult.skipped }}</strong> ignorée(s)
          </p>
          <div class="flex gap-3 justify-center mt-6">
            <UButton variant="outline" color="neutral" @click="reset">Nouvel import</UButton>
            <UButton to="/">Retour au tableau de bord</UButton>
          </div>
        </div>
      </template>
    </UCard>
  </UContainer>
</template>
