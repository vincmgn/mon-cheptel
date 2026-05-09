import { prisma } from '../../../utils/prisma'
import { requireUserId } from '../../../utils/auth'

interface CowRow {
  officialId?: string
  location?: string
  building?: string
  pen?: string
  prophylaxis?: string
  createdAt?: string
}

interface BullRow {
  name?: string
  createdAt?: string
}

interface BreedingRow {
  date?: string
  cowOfficialId?: string
  bullName?: string
  isMaybe?: string
}

interface CalfRow {
  officialId?: string
  sex?: string
  birthDate?: string
  motherOfficialId?: string
}

interface WeighingRow {
  calfOfficialId?: string
  date?: string
  weight?: string
}

function parseDate(val: string | undefined): Date | undefined {
  if (!val?.trim()) return undefined
  const frMatch = val.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (frMatch) {
    const day = frMatch[1]
    const month = frMatch[2]
    const year = frMatch[3]
    if (!day || !month || !year) return undefined
    return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
  }
  const d = new Date(val.trim())
  return isNaN(d.getTime()) ? undefined : d
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)
  const body = await readBody(event)
  const { type, rows } = body as { type: string; rows: unknown[] }

  if (!Array.isArray(rows) || !rows.length) {
    throw createError({ statusCode: 400, message: 'Aucune ligne à traiter' })
  }

  // ── Vaches ──────────────────────────────────────────────────────────────────

  if (type === 'cows') {
    const cowRows = rows as CowRow[]

    const existingCows = await prisma.cow.findMany({
      where: { pen: { building: { location: { userId } } } },
      select: { officialId: true },
    })
    const existingIds = new Set(existingCows.map(c => c.officialId))

    const pens = await prisma.pen.findMany({
      where: { building: { location: { userId } } },
      include: { building: { include: { location: true } } },
    })

    const preview = cowRows.map(row => {
      if (!row.officialId?.trim()) {
        return {
          ...row,
          status: 'missingField',
          message: 'Identifiant manquant',
        }
      }
      if (existingIds.has(row.officialId.trim())) {
        return {
          ...row,
          status: 'duplicate',
          message: `"${row.officialId.trim()}" existe déjà`,
        }
      }
      const pen = pens.find(
        p =>
          p.name.toLowerCase() === row.pen?.trim().toLowerCase() &&
          p.building.name.toLowerCase() ===
            row.building?.trim().toLowerCase() &&
          p.building.location.name.toLowerCase() ===
            row.location?.trim().toLowerCase()
      )
      if (!pen) {
        return {
          ...row,
          status: 'penNotFound',
          message: `Case introuvable : ${row.location} > ${row.building} > ${row.pen}`,
        }
      }
      return { ...row, status: 'ok' }
    })

    return { success: true, data: preview }
  }

  // ── Taureaux ─────────────────────────────────────────────────────────────────

  if (type === 'bulls') {
    const bullRows = rows as BullRow[]

    const existingBulls = await prisma.bull.findMany({
      where: { userId },
      select: { name: true },
    })
    const existingNames = new Set(existingBulls.map(b => b.name.toLowerCase()))

    const preview = bullRows.map(row => {
      if (!row.name?.trim()) {
        return { ...row, status: 'missingField', message: 'Nom manquant' }
      }
      if (existingNames.has(row.name.trim().toLowerCase())) {
        return {
          ...row,
          status: 'duplicate',
          message: `"${row.name.trim()}" existe déjà`,
        }
      }
      return { ...row, status: 'ok' }
    })

    return { success: true, data: preview }
  }

  // ── Inséminations ─────────────────────────────────────────────────────────────

  if (type === 'breedings') {
    const breedingRows = rows as BreedingRow[]

    const cows = await prisma.cow.findMany({
      where: { pen: { building: { location: { userId } } } },
      select: { id: true, officialId: true },
    })
    const cowMap = new Map(cows.map(c => [c.officialId, c.id]))

    const existingBreedings = await prisma.breeding.findMany({
      where: { cow: { pen: { building: { location: { userId } } } } },
      select: { cowId: true, date: true },
    })
    const existingKeys = new Set(
      existingBreedings.map(b => `${b.cowId}:${isoDay(b.date)}`)
    )

    const preview = breedingRows.map(row => {
      if (!row.date?.trim()) {
        return {
          ...row,
          status: 'missingField',
          message: "Date d'insémination manquante",
        }
      }
      if (!row.cowOfficialId?.trim()) {
        return {
          ...row,
          status: 'missingField',
          message: 'Numéro de vache manquant',
        }
      }
      const parsedDate = parseDate(row.date)
      if (!parsedDate) {
        return {
          ...row,
          status: 'missingField',
          message: `Date invalide : ${row.date}`,
        }
      }
      const cowId = cowMap.get(row.cowOfficialId.trim())
      if (!cowId) {
        return {
          ...row,
          status: 'cowNotFound',
          message: `Vache introuvable : ${row.cowOfficialId.trim()}`,
        }
      }
      const key = `${cowId}:${isoDay(parsedDate)}`
      if (existingKeys.has(key)) {
        return {
          ...row,
          status: 'duplicate',
          message: `Insémination déjà enregistrée pour ${row.cowOfficialId.trim()} le ${row.date}`,
        }
      }
      return { ...row, status: 'ok' }
    })

    return { success: true, data: preview }
  }

  // ── Veaux ─────────────────────────────────────────────────────────────────────

  if (type === 'calves') {
    const calfRows = rows as CalfRow[]

    const cows = await prisma.cow.findMany({
      where: { pen: { building: { location: { userId } } } },
      select: { id: true, officialId: true },
    })
    const cowMap = new Map(cows.map(c => [c.officialId, c.id]))

    const existingCalves = await prisma.calf.findMany({
      where: {
        officialId: { not: null },
        cow: { pen: { building: { location: { userId } } } },
      },
      select: { officialId: true },
    })
    const existingCalfIds = new Set(
      existingCalves.map(c => c.officialId!.toLowerCase())
    )

    const preview = calfRows.map(row => {
      if (!row.sex?.trim()) {
        return { ...row, status: 'missingField', message: 'Sexe manquant' }
      }
      if (!row.birthDate?.trim()) {
        return {
          ...row,
          status: 'missingField',
          message: 'Date de naissance manquante',
        }
      }
      if (!row.motherOfficialId?.trim()) {
        return {
          ...row,
          status: 'missingField',
          message: 'Numéro de mère manquant',
        }
      }

      const sexLower = row.sex.trim().toLowerCase()
      if (!['m', 'f', 'mâle', 'male', 'femelle'].includes(sexLower)) {
        return {
          ...row,
          status: 'invalidSex',
          message: `Sexe invalide : ${row.sex} (attendu : Mâle ou Femelle)`,
        }
      }

      if (!parseDate(row.birthDate)) {
        return {
          ...row,
          status: 'missingField',
          message: `Date invalide : ${row.birthDate}`,
        }
      }

      if (!cowMap.has(row.motherOfficialId.trim())) {
        return {
          ...row,
          status: 'motherNotFound',
          message: `Mère introuvable : ${row.motherOfficialId.trim()}`,
        }
      }

      if (
        row.officialId?.trim() &&
        existingCalfIds.has(row.officialId.trim().toLowerCase())
      ) {
        return {
          ...row,
          status: 'duplicate',
          message: `Veau "${row.officialId.trim()}" existe déjà`,
        }
      }

      return { ...row, status: 'ok' }
    })

    return { success: true, data: preview }
  }

  // ── Pesées ────────────────────────────────────────────────────────────────────

  if (type === 'weighings') {
    const weighingRows = rows as WeighingRow[]

    const calves = await prisma.calf.findMany({
      where: {
        officialId: { not: null },
        cow: { pen: { building: { location: { userId } } } },
      },
      select: { id: true, officialId: true },
    })
    const calfMap = new Map(calves.map(c => [c.officialId!, c.id]))

    const preview = weighingRows.map(row => {
      if (!row.calfOfficialId?.trim()) {
        return { ...row, status: 'missingField', message: 'N° veau manquant' }
      }
      if (!row.date?.trim()) {
        return { ...row, status: 'missingField', message: 'Date manquante' }
      }
      if (!row.weight?.trim()) {
        return { ...row, status: 'missingField', message: 'Poids manquant' }
      }
      const parsedDate = parseDate(row.date)
      if (!parsedDate) {
        return {
          ...row,
          status: 'missingField',
          message: `Date invalide : ${row.date}`,
        }
      }
      const w = parseFloat(row.weight.replace(',', '.'))
      if (isNaN(w) || w <= 0) {
        return {
          ...row,
          status: 'invalidWeight',
          message: `Poids invalide : ${row.weight}`,
        }
      }
      if (!calfMap.has(row.calfOfficialId.trim())) {
        return {
          ...row,
          status: 'calfNotFound',
          message: `Veau introuvable : ${row.calfOfficialId.trim()}`,
        }
      }
      return { ...row, status: 'ok' }
    })

    return { success: true, data: preview }
  }

  throw createError({
    statusCode: 400,
    message:
      'Type invalide. Valeurs acceptées : cows, bulls, breedings, calves, weighings',
  })
})
