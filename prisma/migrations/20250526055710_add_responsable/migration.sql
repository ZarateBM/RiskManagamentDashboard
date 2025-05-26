/*
  Warnings:

  - Made the column `responsableId` on table `Incidente` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Incidente" DROP CONSTRAINT "Incidente_responsableId_fkey";

-- AlterTable
ALTER TABLE "Incidente" ALTER COLUMN "responsableId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Incidente" ADD CONSTRAINT "Incidente_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;
