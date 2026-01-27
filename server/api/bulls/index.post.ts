export default defineEventHandler(async event => {
  const body = await readBody(event)

  try {
    const bull = await prisma.bull.create({
      data: {
        name: body.name,
        comments: {
          create: {
            content: body.comment,
          },
        },
      },
    })
    return bull
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Erreur lors de la création du taureau',
    })
  }
})
