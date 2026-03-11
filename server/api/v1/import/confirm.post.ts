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

    let created = 0
    let skipped = 0

    for (const row of cowRows) {
      if (!row.officialId?.trim()) {
        skipped++
        continue
      }
      if (existingIds.has(row.officialId.trim())) {
        skipped++
        continue
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
        skipped++
        continue
      }

      const prophylaxis =
        row.prophylaxis?.trim().toLowerCase() === 'oui' ||
        row.prophylaxis?.trim().toLowerCase() === 'true'
      const createdAt = parseDate(row.createdAt)

      try {
        await prisma.cow.create({
          data: {
            officialId: row.officialId.trim(),
            penId: pen.id,
            prophylaxis,
            ...(createdAt ? { createdAt } : {}),
          },
        })
        existingIds.add(row.officialId.trim())
        created++
      } catch {
        skipped++
      }
    }

    return { success: true, data: { created, skipped } }
  }

  // ── Taureaux ─────────────────────────────────────────────────────────────────

  if (type === 'bulls') {
    const bullRows = rows as BullRow[]

    const existingBulls = await prisma.bull.findMany({
      where: { userId },
      select: { name: true },
    })
    const existingNames = new Set(existingBulls.map(b => b.name.toLowerCase()))

    let created = 0
    let skipped = 0

    for (const row of bullRows) {
      if (!row.name?.trim()) {
        skipped++
        continue
      }
      if (existingNames.has(row.name.trim().toLowerCase())) {
        skipped++
        continue
      }

      const createdAt = parseDate(row.createdAt)

      try {
        await prisma.bull.create({
          data: {
            name: row.name.trim(),
            userId,
            ...(createdAt ? { createdAt } : {}),
          },
        })
        existingNames.add(row.name.trim().toLowerCase())
        created++
      } catch {
        skipped++
      }
    }

    return { success: true, data: { created, skipped } }
  }

  // ── Inséminations ─────────────────────────────────────────────────────────────

  if (type === 'breedings') {
    const breedingRows = rows as BreedingRow[]

    const cows = await prisma.cow.findMany({
      where: { pen: { building: { location: { userId } } } },
      select: { id: true, officialId: true },
    })
    const cowMap = new Map(cows.map(c => [c.officialId, c.id]))

    const bulls = await prisma.bull.findMany({
      where: { userId },
      select: { id: true, name: true },
    })
    const bullMap = new Map(bulls.map(b => [b.name.toLowerCase(), b.id]))

    const existingBreedings = await prisma.breeding.findMany({
      where: { cow: { pen: { building: { location: { userId } } } } },
      select: { cowId: true, date: true },
    })
    const existingKeys = new Set(
      existingBreedings.map(b => `${b.cowId}:${isoDay(b.date)}`)
    )

    let created = 0
    let skipped = 0

    for (const row of breedingRows) {
      if (!row.date?.trim() || !row.cowOfficialId?.trim()) {
        skipped++
        continue
      }

      const parsedDate = parseDate(row.date)
      if (!parsedDate) {
        skipped++
        continue
      }

      const cowId = cowMap.get(row.cowOfficialId.trim())
      if (!cowId) {
        skipped++
        continue
      }

      const key = `${cowId}:${isoDay(parsedDate)}`
      if (existingKeys.has(key)) {
        skipped++
        continue
      }

      const isMaybe = row.isMaybe?.trim().toLowerCase() === 'possible'

      const bullId = row.bullName?.trim()
        ? (bullMap.get(row.bullName.trim().toLowerCase()) ?? null)
        : null
      const bullName =
        !bullId && row.bullName?.trim() ? row.bullName.trim() : null

      try {
        await prisma.breeding.create({
          data: {
            date: parsedDate,
            cowId,
            isMaybe,
            ...(bullId ? { bullId } : {}),
            ...(bullName ? { bullName } : {}),
          },
        })
        existingKeys.add(key)
        created++
      } catch {
        skipped++
      }
    }

    return { success: true, data: { created, skipped } }
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

    let created = 0
    let skipped = 0

    for (const row of calfRows) {
      if (
        !row.sex?.trim() ||
        !row.birthDate?.trim() ||
        !row.motherOfficialId?.trim()
      ) {
        skipped++
        continue
      }

      const birthDate = parseDate(row.birthDate)
      if (!birthDate) {
        skipped++
        continue
      }

      const cowId = cowMap.get(row.motherOfficialId.trim())
      if (!cowId) {
        skipped++
        continue
      }

      const sexLower = row.sex.trim().toLowerCase()
      const sex = ['m', 'mâle', 'male'].includes(sexLower) ? 'M' : 'F'

      const officialId = row.officialId?.trim() || null
      if (officialId && existingCalfIds.has(officialId.toLowerCase())) {
        skipped++
        continue
      }

      try {
        await prisma.calf.create({
          data: {
            cowId,
            sex,
            birthDate,
            ...(officialId ? { officialId } : {}),
          },
        })
        if (officialId) existingCalfIds.add(officialId.toLowerCase())
        created++
      } catch {
        skipped++
      }
    }

    return { success: true, data: { created, skipped } }
  }

  throw createError({
    statusCode: 400,
    message:
      'Type invalide. Valeurs acceptées : cows, bulls, breedings, calves',
  })
})
