import { prisma } from '../../utils/prisma'
import { requireUserId } from '../../utils/auth'

interface BackupBull {
  name: string
  createdAt?: string
}
interface BackupCow {
  officialId: string
  location: string
  building: string
  pen: string
  prophylaxis?: boolean
  createdAt?: string
}
interface BackupBreeding {
  date: string
  cowOfficialId: string
  bullName?: string | null
  isMaybe?: boolean
}
interface BackupCalf {
  officialId?: string | null
  sex: string
  birthDate: string
  motherOfficialId: string
}

interface Backup {
  version?: number
  bulls?: BackupBull[]
  cows?: BackupCow[]
  breedings?: BackupBreeding[]
  calves?: BackupCalf[]
}

function parseDate(val: string | undefined | null): Date | undefined {
  if (!val?.trim()) return undefined
  const d = new Date(val.trim())
  return isNaN(d.getTime()) ? undefined : d
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)
  const backup = (await readBody(event)) as Backup

  const result = {
    bulls: { created: 0, skipped: 0 },
    cows: { created: 0, skipped: 0 },
    breedings: { created: 0, skipped: 0 },
    calves: { created: 0, skipped: 0 },
  }

  // ── 1. Taureaux ────────────────────────────────────────────────────────────

  if (backup.bulls?.length) {
    const existing = await prisma.bull.findMany({
      where: { userId },
      select: { name: true },
    })
    const existingNames = new Set(existing.map(b => b.name.toLowerCase()))

    for (const row of backup.bulls) {
      if (!row.name?.trim()) {
        result.bulls.skipped++
        continue
      }
      if (existingNames.has(row.name.trim().toLowerCase())) {
        result.bulls.skipped++
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
        result.bulls.created++
      } catch {
        result.bulls.skipped++
      }
    }
  }

  // ── 2. Vaches ─────────────────────────────────────────────────────────────

  if (backup.cows?.length) {
    const existing = await prisma.cow.findMany({
      where: { pen: { building: { location: { userId } } } },
      select: { officialId: true },
    })
    const existingIds = new Set(existing.map(c => c.officialId))

    const pens = await prisma.pen.findMany({
      where: { building: { location: { userId } } },
      include: { building: { include: { location: true } } },
    })

    for (const row of backup.cows) {
      if (!row.officialId?.trim()) {
        result.cows.skipped++
        continue
      }
      if (existingIds.has(row.officialId.trim())) {
        result.cows.skipped++
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
        result.cows.skipped++
        continue
      }

      const createdAt = parseDate(row.createdAt)
      try {
        await prisma.cow.create({
          data: {
            officialId: row.officialId.trim(),
            penId: pen.id,
            prophylaxis: row.prophylaxis ?? false,
            ...(createdAt ? { createdAt } : {}),
          },
        })
        existingIds.add(row.officialId.trim())
        result.cows.created++
      } catch {
        result.cows.skipped++
      }
    }
  }

  // ── 3. Inséminations ───────────────────────────────────────────────────────
  // (après création des vaches et taureaux)

  if (backup.breedings?.length) {
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

    const existing = await prisma.breeding.findMany({
      where: { cow: { pen: { building: { location: { userId } } } } },
      select: { cowId: true, date: true },
    })
    const existingKeys = new Set(
      existing.map(b => `${b.cowId}:${isoDay(b.date)}`)
    )

    for (const row of backup.breedings) {
      if (!row.date?.trim() || !row.cowOfficialId?.trim()) {
        result.breedings.skipped++
        continue
      }
      const parsedDate = parseDate(row.date)
      if (!parsedDate) {
        result.breedings.skipped++
        continue
      }
      const cowId = cowMap.get(row.cowOfficialId.trim())
      if (!cowId) {
        result.breedings.skipped++
        continue
      }
      const key = `${cowId}:${isoDay(parsedDate)}`
      if (existingKeys.has(key)) {
        result.breedings.skipped++
        continue
      }

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
            isMaybe: row.isMaybe ?? false,
            ...(bullId ? { bullId } : {}),
            ...(bullName ? { bullName } : {}),
          },
        })
        existingKeys.add(key)
        result.breedings.created++
      } catch {
        result.breedings.skipped++
      }
    }
  }

  // ── 4. Veaux ───────────────────────────────────────────────────────────────

  if (backup.calves?.length) {
    const cows = await prisma.cow.findMany({
      where: { pen: { building: { location: { userId } } } },
      select: { id: true, officialId: true },
    })
    const cowMap = new Map(cows.map(c => [c.officialId, c.id]))

    const existing = await prisma.calf.findMany({
      where: {
        officialId: { not: null },
        cow: { pen: { building: { location: { userId } } } },
      },
      select: { officialId: true },
    })
    const existingIds = new Set(existing.map(c => c.officialId!.toLowerCase()))

    for (const row of backup.calves) {
      if (
        !row.sex?.trim() ||
        !row.birthDate?.trim() ||
        !row.motherOfficialId?.trim()
      ) {
        result.calves.skipped++
        continue
      }
      const birthDate = parseDate(row.birthDate)
      if (!birthDate) {
        result.calves.skipped++
        continue
      }
      const cowId = cowMap.get(row.motherOfficialId.trim())
      if (!cowId) {
        result.calves.skipped++
        continue
      }

      const sexLower = row.sex.trim().toLowerCase()
      const sex = ['m', 'mâle', 'male'].includes(sexLower) ? 'M' : 'F'

      const officialId = row.officialId?.trim() || null
      if (officialId && existingIds.has(officialId.toLowerCase())) {
        result.calves.skipped++
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
        if (officialId) existingIds.add(officialId.toLowerCase())
        result.calves.created++
      } catch {
        result.calves.skipped++
      }
    }
  }

  return { success: true, data: result }
})
