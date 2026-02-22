/**
 * Script de setup de production (idempotent).
 * Crée l'utilisateur admin s'il n'existe pas,
 * et rattache les données orphelines à cet admin.
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  let admin = await prisma.user.findUnique({ where: { username: 'admin' } })

  if (!admin) {
    const hashed = await bcrypt.hash('admin1234', 10)
    admin = await prisma.user.create({
      data: {
        username: 'admin',
        password: hashed,
        farmName: 'Exploitation Admin',
      },
    })
    console.log('✅ Utilisateur admin créé (mdp: admin1234)')
    console.log('⚠️  Pensez à changer le mot de passe depuis le profil!')
  }

  const updatedLocations = await prisma.location.updateMany({
    where: { userId: null },
    data: { userId: admin.id },
  })
  if (updatedLocations.count > 0) {
    console.log(
      `✅ ${updatedLocations.count} location(s) rattachée(s) à l'admin`
    )
  }

  const updatedBulls = await prisma.bull.updateMany({
    where: { userId: null },
    data: { userId: admin.id },
  })
  if (updatedBulls.count > 0) {
    console.log(`✅ ${updatedBulls.count} taureau(x) rattaché(s) à l'admin`)
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
