-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMINISTRADOR', 'EDITOR', 'LECTOR');

-- CreateTable
CREATE TABLE "Usuario" (
    "idUsuario" SERIAL NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contraseña" TEXT NOT NULL,
    "mitigador" BOOLEAN NOT NULL DEFAULT false,
    "rol" "Rol" NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registroEstado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("idUsuario")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "idCategoria" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "registroEstado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("idCategoria")
);

-- CreateTable
CREATE TABLE "Riesgo" (
    "idRiesgo" SERIAL NOT NULL,
    "idCategoria" INTEGER NOT NULL,
    "responsableId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "impacto" TEXT NOT NULL,
    "probabilidad" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idUsuarioRegistro" INTEGER NOT NULL,
    "registroEstado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Riesgo_pkey" PRIMARY KEY ("idRiesgo")
);

-- CreateTable
CREATE TABLE "PlanMitigar" (
    "idPlanMitigar" SERIAL NOT NULL,
    "idRiesgo" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idUsuarioCreador" INTEGER NOT NULL,
    "archivo" TEXT,
    "registroEstado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PlanMitigar_pkey" PRIMARY KEY ("idPlanMitigar")
);

-- CreateTable
CREATE TABLE "PlanEvitar" (
    "idPlanEvitar" SERIAL NOT NULL,
    "idRiesgo" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idUsuarioCreador" INTEGER NOT NULL,
    "archivo" TEXT,
    "registroEstado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PlanEvitar_pkey" PRIMARY KEY ("idPlanEvitar")
);

-- CreateTable
CREATE TABLE "Auditoria" (
    "idAuditoria" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "accion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modulo" TEXT NOT NULL,
    "registroEstado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Auditoria_pkey" PRIMARY KEY ("idAuditoria")
);

-- CreateTable
CREATE TABLE "Incidente" (
    "idIncidente" SERIAL NOT NULL,
    "idCategoria" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "severidad" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estadoIncidente" TEXT NOT NULL,
    "fechaIncidente" TIMESTAMP(3) NOT NULL,
    "accionesTomadas" TEXT NOT NULL,
    "idUsuarioRegistro" INTEGER NOT NULL,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registroEstado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Incidente_pkey" PRIMARY KEY ("idIncidente")
);

-- CreateTable
CREATE TABLE "MonitoreoAmbiental" (
    "idMonitoreo" SERIAL NOT NULL,
    "tipoSensor" TEXT NOT NULL,
    "valorMedido" DOUBLE PRECISION NOT NULL,
    "unidadMedida" TEXT NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL,
    "idUsuarioRegistro" INTEGER NOT NULL,
    "registroEstado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MonitoreoAmbiental_pkey" PRIMARY KEY ("idMonitoreo")
);

-- CreateTable
CREATE TABLE "Reporte" (
    "idReporte" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipoReporte" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "fechaGeneracion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idUsuarioGenerador" INTEGER NOT NULL,
    "registroEstado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Reporte_pkey" PRIMARY KEY ("idReporte")
);

-- CreateTable
CREATE TABLE "Protocolo" (
    "idProtocolo" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fechaPublicacion" TIMESTAMP(3) NOT NULL,
    "idUsuarioPublicador" INTEGER NOT NULL,
    "registroEstado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Protocolo_pkey" PRIMARY KEY ("idProtocolo")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- AddForeignKey
ALTER TABLE "Riesgo" ADD CONSTRAINT "Riesgo_idCategoria_fkey" FOREIGN KEY ("idCategoria") REFERENCES "Categoria"("idCategoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Riesgo" ADD CONSTRAINT "Riesgo_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Riesgo" ADD CONSTRAINT "Riesgo_idUsuarioRegistro_fkey" FOREIGN KEY ("idUsuarioRegistro") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanMitigar" ADD CONSTRAINT "PlanMitigar_idRiesgo_fkey" FOREIGN KEY ("idRiesgo") REFERENCES "Riesgo"("idRiesgo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanMitigar" ADD CONSTRAINT "PlanMitigar_idUsuarioCreador_fkey" FOREIGN KEY ("idUsuarioCreador") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanEvitar" ADD CONSTRAINT "PlanEvitar_idRiesgo_fkey" FOREIGN KEY ("idRiesgo") REFERENCES "Riesgo"("idRiesgo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanEvitar" ADD CONSTRAINT "PlanEvitar_idUsuarioCreador_fkey" FOREIGN KEY ("idUsuarioCreador") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auditoria" ADD CONSTRAINT "Auditoria_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incidente" ADD CONSTRAINT "Incidente_idCategoria_fkey" FOREIGN KEY ("idCategoria") REFERENCES "Categoria"("idCategoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incidente" ADD CONSTRAINT "Incidente_idUsuarioRegistro_fkey" FOREIGN KEY ("idUsuarioRegistro") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitoreoAmbiental" ADD CONSTRAINT "MonitoreoAmbiental_idUsuarioRegistro_fkey" FOREIGN KEY ("idUsuarioRegistro") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_idUsuarioGenerador_fkey" FOREIGN KEY ("idUsuarioGenerador") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Protocolo" ADD CONSTRAINT "Protocolo_idUsuarioPublicador_fkey" FOREIGN KEY ("idUsuarioPublicador") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;
