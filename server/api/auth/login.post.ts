import bcrypt from 'bcrypt'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async event => {
  const body = await readBody(event)

  if (!body?.username?.trim() || !body?.password) {
    throw createError({ statusCode: 400, message: 'Identifiants requis' })
  }

  const user = await prisma.user.findUnique({
    where: { username: body.username.trim().toLowerCase() },
  })

  if (!user || !(await bcrypt.compare(body.password, user.password))) {
    throw createError({
      statusCode: 401,
      message: 'Identifiant ou mot de passe incorrect',
    })
  }

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

  return { success: true, data: { username: user.username, farmName: user.farmName } }
})
