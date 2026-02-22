import bcrypt from 'bcrypt'
import { prisma } from '../../utils/prisma'
import { requireUserId } from '../../utils/auth'

export default defineEventHandler(async event => {
  const userId = await requireUserId(event)
  const body = await readBody(event)

  const updates: { farmName?: string; password?: string } = {}

  // --- Changement de nom d'exploitation ---
  if (body.farmName !== undefined) {
    const newFarmName = body.farmName.trim()
    if (!newFarmName) {
      throw createError({ statusCode: 400, message: "Le nom d'exploitation est requis" })
    }

    const existing = await prisma.user.findFirst({
      where: { farmName: { equals: newFarmName, mode: 'insensitive' }, NOT: { id: userId } },
    })
    if (existing) {
      throw createError({ statusCode: 409, message: "Ce nom d'exploitation est déjà utilisé" })
    }

    updates.farmName = newFarmName
  }

  // --- Changement de mot de passe ---
  if (body.currentPassword !== undefined || body.newPassword !== undefined) {
    if (!body.currentPassword || !body.newPassword || !body.confirmPassword) {
      throw createError({ statusCode: 400, message: 'Tous les champs mot de passe sont requis' })
    }
    if (body.newPassword !== body.confirmPassword) {
      throw createError({ statusCode: 400, message: 'Les mots de passe ne correspondent pas' })
    }
    if (body.newPassword.length < 8) {
      throw createError({ statusCode: 400, message: 'Le mot de passe doit contenir au moins 8 caractères' })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !(await bcrypt.compare(body.currentPassword, user.password))) {
      throw createError({ statusCode: 401, message: 'Mot de passe actuel incorrect' })
    }

    updates.password = await bcrypt.hash(body.newPassword, 10)
  }

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, message: 'Aucune modification fournie' })
  }

  const updated = await prisma.user.update({ where: { id: userId }, data: updates })

  // Mettre à jour la session si le farmName a changé
  if (updates.farmName) {
    const session = await getUserSession(event)
    await setUserSession(event, {
      user: {
        id: updated.id,
        username: updated.username,
        farmName: updated.farmName,
      },
    })
  }

  return { success: true, data: { username: updated.username, farmName: updated.farmName } }
})
