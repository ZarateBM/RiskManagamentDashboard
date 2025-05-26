-- AlterTable
ALTER TABLE "Incidente" ADD COLUMN     "responsableId" INTEGER;

-- AddForeignKey
ALTER TABLE "Incidente" ADD CONSTRAINT "Incidente_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Usuario"("idUsuario") ON DELETE SET NULL ON UPDATE CASCADE;
