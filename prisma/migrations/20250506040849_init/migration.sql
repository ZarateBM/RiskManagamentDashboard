-- CreateTable
CREATE TABLE "Categoria" (
    "idCategoria" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "registroEstado" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Riesgo" (
    "idRiesgo" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idCategoria" INTEGER NOT NULL,
    "responsableId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "impacto" TEXT NOT NULL,
    "probabilidad" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "fechaRegistro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idUsuarioRegistro" INTEGER NOT NULL,
    "registroEstado" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Riesgo_idCategoria_fkey" FOREIGN KEY ("idCategoria") REFERENCES "Categoria" ("idCategoria") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Riesgo_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Usuario" ("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Riesgo_idUsuarioRegistro_fkey" FOREIGN KEY ("idUsuarioRegistro") REFERENCES "Usuario" ("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlanMitigar" (
    "idPlanMitigar" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idRiesgo" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idUsuarioCreador" INTEGER NOT NULL,
    "archivo" TEXT,
    "registroEstado" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "PlanMitigar_idRiesgo_fkey" FOREIGN KEY ("idRiesgo") REFERENCES "Riesgo" ("idRiesgo") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlanMitigar_idUsuarioCreador_fkey" FOREIGN KEY ("idUsuarioCreador") REFERENCES "Usuario" ("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlanEvitar" (
    "idPlanEvitar" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idRiesgo" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idUsuarioCreador" INTEGER NOT NULL,
    "archivo" TEXT,
    "registroEstado" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "PlanEvitar_idRiesgo_fkey" FOREIGN KEY ("idRiesgo") REFERENCES "Riesgo" ("idRiesgo") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlanEvitar_idUsuarioCreador_fkey" FOREIGN KEY ("idUsuarioCreador") REFERENCES "Usuario" ("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Auditoria" (
    "idAuditoria" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idUsuario" INTEGER NOT NULL,
    "accion" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modulo" TEXT NOT NULL,
    "registroEstado" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Auditoria_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario" ("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Incidente" (
    "idIncidente" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idCategoria" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "severidad" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estadoIncidente" TEXT NOT NULL,
    "fechaIncidente" DATETIME NOT NULL,
    "accionesTomadas" TEXT NOT NULL,
    "idUsuarioRegistro" INTEGER NOT NULL,
    "fechaRegistro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registroEstado" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Incidente_idCategoria_fkey" FOREIGN KEY ("idCategoria") REFERENCES "Categoria" ("idCategoria") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Incidente_idUsuarioRegistro_fkey" FOREIGN KEY ("idUsuarioRegistro") REFERENCES "Usuario" ("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonitoreoAmbiental" (
    "idMonitoreo" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipoSensor" TEXT NOT NULL,
    "valorMedido" REAL NOT NULL,
    "unidadMedida" TEXT NOT NULL,
    "fechaHora" DATETIME NOT NULL,
    "idUsuarioRegistro" INTEGER NOT NULL,
    "registroEstado" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "MonitoreoAmbiental_idUsuarioRegistro_fkey" FOREIGN KEY ("idUsuarioRegistro") REFERENCES "Usuario" ("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reporte" (
    "idReporte" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "tipoReporte" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "fechaGeneracion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idUsuarioGenerador" INTEGER NOT NULL,
    "registroEstado" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Reporte_idUsuarioGenerador_fkey" FOREIGN KEY ("idUsuarioGenerador") REFERENCES "Usuario" ("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Protocolo" (
    "idProtocolo" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fechaPublicacion" DATETIME NOT NULL,
    "idUsuarioPublicador" INTEGER NOT NULL,
    "registroEstado" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Protocolo_idUsuarioPublicador_fkey" FOREIGN KEY ("idUsuarioPublicador") REFERENCES "Usuario" ("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE
);
