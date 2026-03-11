<script setup lang="ts">
useHead({ title: 'Export de données' })

type ExportType = 'cows' | 'bulls' | 'calves' | 'breedings'

interface FieldDef {
  key: string
  label: string
  default: boolean
}

// ── Type options ────────────────────────────────────────────────────────────

const typeOptions: { value: ExportType; label: string; emoji: string }[] = [
  { value: 'cows', label: 'Vaches', emoji: '🐄' },
  { value: 'bulls', label: 'Taureaux', emoji: '🐂' },
  { value: 'calves', label: 'Veaux', emoji: '🐮' },
  { value: 'breedings', label: 'Inséminations', emoji: '💉' },
]

// ── Field definitions ────────────────────────────────────────────────────────

const fieldDefs: Record<ExportType, FieldDef[]> = {
  cows: [
    { key: 'officialId', label: 'N°', default: true },
    { key: 'location', label: 'Lieu', default: true },
    { key: 'building', label: 'Bâtiment', default: true },
    { key: 'pen', label: 'Case', default: true },
    { key: 'prophylaxis', label: 'Prophylaxie', default: true },
    { key: 'createdAt', label: "Date d'entrée", default: true },
    { key: 'calvesCount', label: 'Nombre de veaux', default: true },
    { key: 'breedingsCount', label: "Nombre d'inséminations", default: true },
    {
      key: 'lastBreedingDate',
      label: 'Dernière insémination (date)',
      default: true,
    },
    {
      key: 'lastBreedingBull',
      label: 'Dernière insémination (taureau)',
      default: true,
    },
  ],
  bulls: [
    { key: 'name', label: 'Nom', default: true },
    { key: 'createdAt', label: "Date d'ajout", default: true },
    { key: 'breedingsCount', label: "Nombre d'inséminations", default: true },
  ],
  calves: [
    { key: 'officialId', label: 'N°', default: true },
    { key: 'sex', label: 'Sexe', default: true },
    { key: 'birthDate', label: 'Date de naissance', default: true },
    { key: 'motherOfficialId', label: 'Mère (N°)', default: true },
    { key: 'motherLocation', label: 'Lieu de la mère', default: false },
    { key: 'motherBuilding', label: 'Bâtiment de la mère', default: false },
  ],
  breedings: [
    { key: 'date', label: "Date d'insémination", default: true },
    { key: 'cowOfficialId', label: 'Vache (N°)', default: true },
    { key: 'cowLocation', label: 'Lieu de la vache', default: true },
    { key: 'bullName', label: 'Taureau', default: true },
    { key: 'isMaybe', label: 'Statut', default: true },
    { key: 'expectedCalving', label: 'Vêlage prévu (+283j)', default: true },
  ],
}

// ── State ────────────────────────────────────────────────────────────────────

const exportType = ref<ExportType>('cows')
const dateFrom = ref('')
const dateTo = ref('')
const selectedFields = ref<Record<string, boolean>>(
  Object.fromEntries(fieldDefs.cows.map(f => [f.key, f.default]))
)

watch(exportType, type => {
  selectedFields.value = Object.fromEntries(
    fieldDefs[type].map(f => [f.key, f.default])
  )
  dateFrom.value = ''
  dateTo.value = ''
})

// ── Data fetch ───────────────────────────────────────────────────────────────

const {
  data: rawResponse,
  status,
  refresh,
} = await useFetch<{ success: boolean; data: unknown[] }>(
  () => `/api/v1/export?type=${exportType.value}`
)

watch(exportType, () => refresh())

// ── Filtering (client-side) ──────────────────────────────────────────────────

const filteredData = computed(() => {
  const items = rawResponse.value?.data ?? []
  if (!dateFrom.value && !dateTo.value) return items

  return items.filter((item: unknown) => {
    const record = item as Record<string, unknown>
    let dateField: string
    if (exportType.value === 'calves') dateField = record.birthDate as string
    else if (exportType.value === 'breedings') dateField = record.date as string
    else dateField = record.createdAt as string

    const d = new Date(dateField)
    if (dateFrom.value && d < new Date(dateFrom.value)) return false
    if (dateTo.value && d > new Date(dateTo.value + 'T23:59:59')) return false
    return true
  })
})

const activeColumns = computed(() =>
  fieldDefs[exportType.value].filter(f => selectedFields.value[f.key])
)

const periodLabel = computed(() => {
  if (exportType.value === 'calves') return 'Filtré sur la date de naissance'
  if (exportType.value === 'breedings')
    return "Filtré sur la date d'insémination"
  return "Filtré sur la date d'entrée"
})

// ── Cell value resolver ──────────────────────────────────────────────────────

function formatDate(d: string | Date | null | undefined): string {
  if (!d) return ''
  return new Date(d).toLocaleDateString('fr-FR')
}

function getCellValue(item: unknown, fieldKey: string): string | number {
  const r = item as Record<string, unknown>
  const type = exportType.value

  if (type === 'cows') {
    const pen = r.pen as Record<string, unknown> | null
    const building = pen?.building as Record<string, unknown> | null
    const location = building?.location as Record<string, unknown> | null
    const breedings = r.breedings as Record<string, unknown>[] | undefined
    const lastBreeding = breedings?.[0] as Record<string, unknown> | undefined
    const lastBull = lastBreeding?.bull as Record<string, unknown> | undefined
    const count = r._count as Record<string, number> | undefined

    switch (fieldKey) {
      case 'officialId':
        return String(r.officialId ?? '')
      case 'location':
        return String(location?.name ?? '')
      case 'building':
        return String(building?.name ?? '')
      case 'pen':
        return String(pen?.name ?? '')
      case 'prophylaxis':
        return r.prophylaxis ? 'Oui' : 'Non'
      case 'createdAt':
        return formatDate(r.createdAt as string)
      case 'calvesCount':
        return count?.calves ?? 0
      case 'breedingsCount':
        return count?.breedings ?? 0
      case 'lastBreedingDate':
        return lastBreeding ? formatDate(lastBreeding.date as string) : ''
      case 'lastBreedingBull':
        return String(lastBull?.name ?? lastBreeding?.bullName ?? '')
    }
  }

  if (type === 'bulls') {
    const count = r._count as Record<string, number> | undefined
    switch (fieldKey) {
      case 'name':
        return String(r.name ?? '')
      case 'createdAt':
        return formatDate(r.createdAt as string)
      case 'breedingsCount':
        return count?.breedings ?? 0
    }
  }

  if (type === 'calves') {
    const cow = r.cow as Record<string, unknown> | null
    const pen = (cow?.pen as Record<string, unknown> | null) ?? null
    const building = (pen?.building as Record<string, unknown> | null) ?? null
    const location =
      (building?.location as Record<string, unknown> | null) ?? null
    switch (fieldKey) {
      case 'officialId':
        return String(r.officialId ?? 'Non identifié')
      case 'sex':
        return r.sex === 'M' ? 'Mâle' : 'Femelle'
      case 'birthDate':
        return formatDate(r.birthDate as string)
      case 'motherOfficialId':
        return String(cow?.officialId ?? '')
      case 'motherLocation':
        return String(location?.name ?? '')
      case 'motherBuilding':
        return String(building?.name ?? '')
    }
  }

  if (type === 'breedings') {
    const cow = r.cow as Record<string, unknown> | null
    const pen = (cow?.pen as Record<string, unknown> | null) ?? null
    const building = (pen?.building as Record<string, unknown> | null) ?? null
    const location =
      (building?.location as Record<string, unknown> | null) ?? null
    const bull = r.bull as Record<string, unknown> | null
    switch (fieldKey) {
      case 'date':
        return formatDate(r.date as string)
      case 'cowOfficialId':
        return String(cow?.officialId ?? '')
      case 'cowLocation':
        return String(location?.name ?? '')
      case 'bullName':
        return String(bull?.name ?? r.bullName ?? 'Inconnu')
      case 'isMaybe':
        return r.isMaybe ? 'Possible' : 'Confirmé'
      case 'expectedCalving': {
        if (!r.date) return ''
        const d = new Date(r.date as string)
        d.setDate(d.getDate() + 283)
        return formatDate(d)
      }
    }
  }

  return ''
}

// ── Build rows for export ────────────────────────────────────────────────────

function buildRows(): Record<string, string | number>[] {
  return filteredData.value.map(item => {
    const row: Record<string, string | number> = {}
    for (const field of activeColumns.value) {
      row[field.label] = getCellValue(item, field.key)
    }
    return row
  })
}

// ── Select all / none ────────────────────────────────────────────────────────

function selectAll() {
  fieldDefs[exportType.value].forEach(f => {
    selectedFields.value[f.key] = true
  })
}

function selectNone() {
  fieldDefs[exportType.value].forEach(f => {
    selectedFields.value[f.key] = false
  })
}

// ── Download helper ──────────────────────────────────────────────────────────

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

// ── CSV export ───────────────────────────────────────────────────────────────

function exportCSV() {
  const rows = buildRows()
  const firstRow = rows[0]
  if (!firstRow) return

  const headers = Object.keys(firstRow)
  const lines = [
    headers.join(';'),
    ...rows.map(row =>
      headers
        .map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`)
        .join(';')
    ),
  ]
  const blob = new Blob(['\ufeff' + lines.join('\n')], {
    type: 'text/csv;charset=utf-8;',
  })
  triggerDownload(blob, `export_${exportType.value}_${today()}.csv`)
}

// ── Excel export ─────────────────────────────────────────────────────────────

async function exportExcel() {
  const rows = buildRows()
  if (!rows.length) return

  const XLSX = await import('xlsx')
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  const sheetName =
    typeOptions.find(t => t.value === exportType.value)?.label ??
    exportType.value
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, `export_${exportType.value}_${today()}.xlsx`)
}

// ── PDF export (download) ────────────────────────────────────────────────────

async function exportPDF() {
  if (!filteredData.value.length || !activeColumns.value.length) return

  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')
  const appConfig = useAppConfig()

  const themeToRgb: Record<string, [number, number, number]> = {
    green: [34, 197, 94],
    sky: [14, 165, 233],
    violet: [139, 92, 246],
    orange: [249, 115, 22],
  }
  const primaryTheme = String(appConfig.ui?.colors?.primary ?? 'green')
  const primaryRgb = themeToRgb[primaryTheme] ?? themeToRgb.green

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })

  const farmName = String(user.value?.farmName ?? 'Mon Cheptel')
  const exportTypeLabel = typeLabel.value
  const pageWidth = doc.internal.pageSize.getWidth()
  const marginX = 8
  const availableWidth = pageWidth - marginX * 2

  doc.setFontSize(14)
  doc.text(`${farmName} — ${exportTypeLabel}`, marginX, 12)
  doc.setFontSize(9)

  const periodText =
    dateFrom.value || dateTo.value
      ? ` · Période: ${dateFrom.value ? formatDate(dateFrom.value) : '...'} -> ${dateTo.value ? formatDate(dateTo.value) : '...'}`
      : ''
  doc.text(
    `Généré le ${new Date().toLocaleDateString('fr-FR')} · ${filteredData.value.length} enregistrement(s)${periodText}`,
    marginX,
    17
  )

  const headers = activeColumns.value.map(col => col.label)
  const body = filteredData.value.map(item =>
    activeColumns.value.map(col => String(getCellValue(item, col.key) ?? ''))
  )

  const colWidth = availableWidth / Math.max(headers.length, 1)
  const columnStyles = Object.fromEntries(
    headers.map((_, idx) => [idx, { cellWidth: colWidth }])
  ) as Record<number, { cellWidth: number }>

  autoTable(doc, {
    startY: 22,
    margin: { left: marginX, right: marginX, top: 10, bottom: 10 },
    head: [headers],
    body,
    tableWidth: availableWidth,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 1.4,
      overflow: 'linebreak',
      valign: 'middle',
    },
    headStyles: {
      fontStyle: 'bold',
      fillColor: primaryRgb,
      textColor: [255, 255, 255],
    },
    columnStyles,
  })

  doc.save(`export_${exportType.value}_${today()}.pdf`)
}

// ── User session for print header ────────────────────────────────────────────

const { user } = useUserSession()

const typeLabel = computed(
  () => typeOptions.find(t => t.value === exportType.value)?.label ?? ''
)

const previewRows = computed(() => filteredData.value.slice(0, 100))
const hasMore = computed(() => filteredData.value.length > 100)
</script>

<template>
  <UContainer class="py-10 max-w-4xl print:max-w-full print:py-4 print:px-4">
    <!-- Print-only header -->
    <div class="hidden print:block mb-6 border-b pb-4">
      <h1 class="text-2xl font-bold">{{ user?.farmName }} — {{ typeLabel }}</h1>
      <p class="text-sm text-gray-500 mt-1">
        Généré le {{ new Date().toLocaleDateString('fr-FR') }}
        <span v-if="dateFrom || dateTo">
          · Période :
          {{ dateFrom ? formatDate(dateFrom) : '…' }}
          →
          {{ dateTo ? formatDate(dateTo) : '…' }}
        </span>
        · {{ filteredData.length }} enregistrement(s)
      </p>
    </div>

    <!-- Page header (hidden in print) -->
    <div class="print:hidden">
      <div class="flex items-center gap-3 mb-8">
        <UButton
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="ghost"
          to="/"
        />
        <div>
          <h1 class="text-2xl font-bold">Export de données</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Exportez vos données en CSV, Excel ou PDF
          </p>
        </div>
      </div>

      <!-- Configuration card -->
      <UCard class="mb-6 space-y-8">
        <!-- Step 1 : Type -->
        <div>
          <p
            class="text-md font-semibold text-gray-400 uppercase tracking-wider mb-3"
          >
            1. Type de données
          </p>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              v-for="opt in typeOptions"
              :key="opt.value"
              class="flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 text-sm font-medium transition-all cursor-pointer"
              :class="
                exportType === opt.value
                  ? 'border-primary bg-primary/5 text-primary dark:bg-primary/10'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
              "
              @click="exportType = opt.value as ExportType"
            >
              <span class="text-lg leading-none">{{ opt.emoji }}</span>
              {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- Step 2 : Période -->
        <div class="mt-6">
          <p
            class="text-md font-semibold text-gray-400 uppercase tracking-wider mb-3"
          >
            2. Période
            <span class="font-normal normal-case text-gray-400"
              >(optionnel)</span
            >
          </p>
          <div class="flex items-center gap-3 flex-wrap">
            <div class="flex items-center gap-2">
              <label
                class="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap"
                >Du</label
              >
              <UInput v-model="dateFrom" type="date" size="sm" />
            </div>
            <div class="flex items-center gap-2">
              <label
                class="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap"
                >Au</label
              >
              <UInput v-model="dateTo" type="date" size="sm" />
            </div>
            <UButton
              v-if="dateFrom || dateTo"
              variant="ghost"
              size="sm"
              color="neutral"
              icon="i-lucide-x"
              @click="((dateFrom = ''), (dateTo = ''))"
            >
              Effacer
            </UButton>
          </div>
          <p class="text-xs text-gray-400 mt-1.5">{{ periodLabel }}</p>
        </div>

        <!-- Step 3 : Champs -->
        <div class="mt-6">
          <div class="flex items-center justify-between mb-3">
            <p
              class="text-md font-semibold text-gray-400 uppercase tracking-wider"
            >
              3. Champs à exporter
            </p>
            <div class="flex gap-1">
              <UButton
                variant="ghost"
                size="xs"
                color="neutral"
                @click="selectAll"
              >
                Tout
              </UButton>
              <UButton
                variant="ghost"
                size="xs"
                color="neutral"
                @click="selectNone"
              >
                Aucun
              </UButton>
            </div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <UCheckbox
              v-for="field in fieldDefs[exportType]"
              :key="field.key"
              :model-value="selectedFields[field.key]"
              :label="field.label"
              @update:model-value="
                val => (selectedFields[field.key] = Boolean(val))
              "
            />
          </div>
        </div>

        <!-- Step 4 : Export -->
        <div class="mt-6">
          <p
            class="text-md font-semibold text-gray-400 uppercase tracking-wider mb-3"
          >
            4. Exporter
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
            <template v-if="status === 'pending'">Chargement…</template>
            <template v-else>
              <strong>{{ filteredData.length }}</strong> enregistrement(s) ·
              <strong>{{ activeColumns.length }}</strong> colonne(s)
            </template>
          </p>
          <div class="flex gap-3 flex-wrap">
            <UButton
              icon="i-lucide-file-text"
              variant="outline"
              color="neutral"
              :disabled="
                !filteredData.length ||
                status === 'pending' ||
                !activeColumns.length
              "
              @click="exportCSV"
            >
              CSV
            </UButton>
            <UButton
              icon="i-lucide-table-2"
              variant="outline"
              color="success"
              :disabled="
                !filteredData.length ||
                status === 'pending' ||
                !activeColumns.length
              "
              @click="exportExcel"
            >
              Excel
            </UButton>
            <UButton
              icon="i-lucide-printer"
              variant="outline"
              color="error"
              :disabled="
                !filteredData.length ||
                status === 'pending' ||
                !activeColumns.length
              "
              @click="exportPDF"
            >
              PDF
            </UButton>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Preview / print table -->
    <div class="mt-6">
      <div class="print:hidden flex items-center justify-between mb-3">
        <h2 class="font-semibold text-gray-700 dark:text-gray-300">Aperçu</h2>
        <UBadge v-if="filteredData.length" color="primary" variant="subtle">
          {{ filteredData.length }} ligne(s)
        </UBadge>
      </div>

      <!-- Loading skeletons -->
      <div v-if="status === 'pending'" class="space-y-2">
        <div
          v-for="i in 6"
          :key="i"
          class="h-10 rounded-lg animate-pulse bg-gray-100 dark:bg-gray-800"
        />
      </div>

      <!-- Empty state -->
      <div
        v-else-if="!filteredData.length"
        class="text-center py-16 text-gray-400 dark:text-gray-600"
      >
        <UIcon name="i-lucide-inbox" class="size-10 mx-auto mb-3" />
        <p class="text-sm">Aucune donnée pour ces critères</p>
      </div>

      <!-- No columns selected -->
      <div
        v-else-if="!activeColumns.length"
        class="text-center py-16 text-gray-400 dark:text-gray-600"
      >
        <UIcon name="i-lucide-columns-3" class="size-10 mx-auto mb-3" />
        <p class="text-sm">Sélectionnez au moins un champ à exporter</p>
      </div>

      <!-- Table -->
      <template v-else>
        <div
          class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  v-for="col in activeColumns"
                  :key="col.key"
                  class="text-left px-3 py-2.5 font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap border-b border-gray-200 dark:border-gray-700"
                >
                  {{ col.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, i) in previewRows"
                :key="i"
                class="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors print:hover:bg-transparent"
              >
                <td
                  v-for="col in activeColumns"
                  :key="col.key"
                  class="px-3 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap"
                >
                  {{ getCellValue(item, col.key) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p
          v-if="hasMore"
          class="text-xs text-gray-400 mt-2 text-center print:hidden"
        >
          Aperçu limité à 100 lignes · L'export inclut la totalité des
          {{ filteredData.length }} enregistrements
        </p>
      </template>
    </div>
  </UContainer>
</template>

<style>
@media print {
  @page {
    size: A4 landscape;
    margin: 12mm;
  }
}
</style>
