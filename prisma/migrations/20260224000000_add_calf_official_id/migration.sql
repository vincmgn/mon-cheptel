-- AlterTable
ALTER TABLE "Calf" ADD COLUMN "officialId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Calf_officialId_key" ON "Calf"("officialId");
