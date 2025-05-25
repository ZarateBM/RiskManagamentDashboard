/*
  Warnings:

  - Added the required column `categoria` to the `Protocolo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pasos` to the `Protocolo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `severidad` to the `Protocolo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tiempoEstimado` to the `Protocolo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Protocolo" ADD COLUMN     "categoria" TEXT NOT NULL,
ADD COLUMN     "herramientas" TEXT[],
ADD COLUMN     "pasos" JSONB NOT NULL,
ADD COLUMN     "severidad" TEXT NOT NULL,
ADD COLUMN     "tiempoEstimado" TEXT NOT NULL,
ALTER COLUMN "fechaPublicacion" SET DEFAULT CURRENT_TIMESTAMP;
