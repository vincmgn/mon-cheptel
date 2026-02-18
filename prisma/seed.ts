import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  // Nettoyage de la base de données + reset des séquences d'IDs
  await prisma.$executeRaw`TRUNCATE TABLE "Comment", "Breeding", "Calf", "Cow", "Bull", "Pen", "Building", "Location" RESTART IDENTITY CASCADE`

  console.log('Database cleaned.')

  // 1. Création des Locations
  const locationFerme = await prisma.location.create({
    data: {
      name: 'Ferme Principale',
    },
  })

  // 2. Création des Bâtiments
  const batimentNord = await prisma.building.create({
    data: {
      name: 'Étable Nord',
      locationId: locationFerme.id,
    },
  })

  const batimentSud = await prisma.building.create({
    data: {
      name: 'Étable Sud',
      locationId: locationFerme.id,
    },
  })

  // 3. Création des Enclos (Pens)
  const pen1 = await prisma.pen.create({
    data: {
      name: 'Box A1',
      buildingId: batimentNord.id,
    },
  })

  const _pen2 = await prisma.pen.create({
    data: {
      name: 'Box A2',
      buildingId: batimentNord.id,
    },
  })

  const pen3 = await prisma.pen.create({
    data: {
      name: 'Pâturage Sud',
      buildingId: batimentSud.id,
    },
  })

  // 4. Création des Taureaux
  const bullHercule = await prisma.bull.create({
    data: {
      name: 'Hercule',
    },
  })

  const _bullCesar = await prisma.bull.create({
    data: {
      name: 'César',
    },
  })

  // 5. Création des Vaches
  const cowMarguerite = await prisma.cow.create({
    data: {
      officialId: 'FR-1234567890',
      penId: pen1.id,
      prophylaxis: true,
      comments: {
        create: {
          content: 'Vache très docile.',
        },
      },
    },
  })

  const cowPaquerette = await prisma.cow.create({
    data: {
      officialId: 'FR-0987654321',
      penId: pen1.id, // Même box
      prophylaxis: false,
    },
  })

  const cowRosie = await prisma.cow.create({
    data: {
      officialId: 'FR-1122334455',
      penId: pen3.id,
    },
  })

  // 6. Inséminations / Reproductions
  await prisma.breeding.create({
    data: {
      date: new Date('2025-01-10'),
      isMaybe: false,
      cowId: cowMarguerite.id,
      bullId: bullHercule.id,
    },
  })

  await prisma.breeding.create({
    data: {
      date: new Date('2025-01-15'),
      isMaybe: true, // Saillie possible
      cowId: cowPaquerette.id,
      bullName: 'Taureau Voisin', // Pas un taureau de notre DB
    },
  })

  // 7. Veaux
  await prisma.calf.create({
    data: {
      sex: 'F',
      birthDate: new Date('2024-12-25'),
      cowId: cowRosie.id,
      comments: {
        create: {
          content: 'Né à Noël, en bonne santé.',
        },
      },
    },
  })

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async e => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
