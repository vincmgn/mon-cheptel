import bcrypt from 'bcrypt'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async event => {
  const body = await readBody(event)

  if (!body?.username?.trim()) {
    throw createError({ statusCode: 400, message: 'Le nom d\'utilisateur est requis' })
  }
  if (!body?.password) {
    throw createError({ statusCode: 400, message: 'Le mot de passe est requis' })
  }
  if (!body?.farmName?.trim()) {
    throw createError({ statusCode: 400, message: 'Le nom de l\'exploitation est requis' })
  }

  const username = body.username.trim().toLowerCase()

  if (username.length < 4) {
    throw createError({
      statusCode: 400,
      message: 'Le nom d\'utilisateur doit faire au moins 4 caractères',
    })
  }
  if (body.password.length < 4) {
    throw createError({
      statusCode: 400,
      message: 'Le mot de passe doit faire au moins 4 caractères',
    })
  }

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) {
    throw createError({
      statusCode: 409,
      message: 'Ce nom d\'utilisateur est déjà pris',
    })
  }

  const hashed = await bcrypt.hash(body.password, 10)
  const user = await prisma.user.create({
    data: {
      username,
      password: hashed,
      farmName: body.farmName.trim(),
    },
  })

  await setUserSession(
    event,
    {
      user: {
        id: user.id,
        username: user.username,
        farmName: user.farmName,
      },
    },
    { maxAge: 60 * 60 * 24 * 30 }
  )

  setResponseStatus(event, 201)
  return { success: true, data: { username: user.username, farmName: user.farmName } }
})
