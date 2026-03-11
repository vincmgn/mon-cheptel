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

    const preview = cowRows.map(row => {
      if (!row.officialId?.trim()) {
        return { ...row, status: 'missingField', message: 'Identifiant manquant' }
      }
      if (existingIds.has(row.officialId.trim())) {
        return { ...row, status: 'duplicate', message: `"${row.officialId.trim()}" existe déjà` }
      }
      const pen = pens.find(
        p =>
          p.name.toLowerCase() === row.pen?.trim().toLowerCase() &&
          p.building.name.toLowerCase() === row.building?.trim().toLowerCase() &&
          p.building.location.name.toLowerCase() === row.location?.trim().toLowerCase()
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
        return { ...row, status: 'duplicate', message: `"${row.name.trim()}" existe déjà` }
      }
      return { ...row, status: 'ok' }
    })

    return { success: true, data: preview }
  }

  throw createError({
    statusCode: 400,
    message: 'Type invalide. Valeurs acceptées : cows, bulls',
  })
})
