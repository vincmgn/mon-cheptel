-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Building" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "locationId" INTEGER NOT NULL,

    CONSTRAINT "Building_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pen" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "buildingId" INTEGER NOT NULL,

    CONSTRAINT "Pen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cow" (
    "id" SERIAL NOT NULL,
    "officialId" TEXT NOT NULL,
    "penId" INTEGER NOT NULL,
    "prophylaxis" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Calf" (
    "id" SERIAL NOT NULL,
    "sex" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cowId" INTEGER NOT NULL,

    CONSTRAINT "Calf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bull" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bull_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Breeding" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isMaybe" BOOLEAN NOT NULL DEFAULT false,
    "cowId" INTEGER NOT NULL,
    "bullId" INTEGER,
    "bullName" TEXT,

    CONSTRAINT "Breeding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cowId" INTEGER,
    "calfId" INTEGER,
    "bullId" INTEGER,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cow_officialId_key" ON "Cow"("officialId");

-- CreateIndex
CREATE UNIQUE INDEX "Bull_name_key" ON "Bull"("name");

-- AddForeignKey
ALTER TABLE "Building" ADD CONSTRAINT "Building_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pen" ADD CONSTRAINT "Pen_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cow" ADD CONSTRAINT "Cow_penId_fkey" FOREIGN KEY ("penId") REFERENCES "Pen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calf" ADD CONSTRAINT "Calf_cowId_fkey" FOREIGN KEY ("cowId") REFERENCES "Cow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Breeding" ADD CONSTRAINT "Breeding_cowId_fkey" FOREIGN KEY ("cowId") REFERENCES "Cow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Breeding" ADD CONSTRAINT "Breeding_bullId_fkey" FOREIGN KEY ("bullId") REFERENCES "Bull"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_cowId_fkey" FOREIGN KEY ("cowId") REFERENCES "Cow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_calfId_fkey" FOREIGN KEY ("calfId") REFERENCES "Calf"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_bullId_fkey" FOREIGN KEY ("bullId") REFERENCES "Bull"("id") ON DELETE SET NULL ON UPDATE CASCADE;
