-- CreateTable
CREATE TABLE "Weighing" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weight" DOUBLE PRECISION NOT NULL,
    "calfId" INTEGER NOT NULL,

    CONSTRAINT "Weighing_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Weighing" ADD CONSTRAINT "Weighing_calfId_fkey" FOREIGN KEY ("calfId") REFERENCES "Calf"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
