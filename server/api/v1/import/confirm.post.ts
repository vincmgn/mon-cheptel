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

function parseDate(val: string | undefined): Date | undefined {
  if (!val?.trim()) return undefined
  // dd/mm/yyyy (French format from export)
  const frMatch = val.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (frMatch) {
    return new Date(`${frMatch[3]}-${frMatch[2].padStart(2, '0')}-${frMatch[1].padStart(2, '0')}`)
  }
  const d = new Date(val.trim())
  return isNaN(d.getTime()) ? undefined : d
}

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)
  const body = await readBody(event)
  const { type, rows } = body as { type: string; rows: unknown[] }

  if (!Array.isArray(rows) || !rows.length) {
    throw createError({ statusCode: 400, message: 'Aucune ligne à traiter' })
  }

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
      if (!row.officialId?.trim()) { skipped++; continue }
      if (existingIds.has(row.officialId.trim())) { skipped++; continue }

      const pen = pens.find(
        p =>
          p.name.toLowerCase() === row.pen?.trim().toLowerCase() &&
          p.building.name.toLowerCase() === row.building?.trim().toLowerCase() &&
          p.building.location.name.toLowerCase() === row.location?.trim().toLowerCase()
      )
      if (!pen) { skipped++; continue }

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
      if (!row.name?.trim()) { skipped++; continue }
      if (existingNames.has(row.name.trim().toLowerCase())) { skipped++; continue }

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

  throw createError({
    statusCode: 400,
    message: 'Type invalide. Valeurs acceptées : cows, bulls',
  })
})
