// api/incidents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// CREATE - POST /api/incidents
export async function POST(req: NextRequest) {
  const data = await req.json();
  const {
    idCategoria,
    titulo,
    severidad,
    descripcion,
    estadoIncidente,
    fechaIncidente,
    accionesTomadas,
    idUsuarioRegistro,
  } = data;

  try {
    const incidente = await prisma.incidente.create({
      data: {
        idCategoria,
        titulo,
        severidad,
        descripcion,
        estadoIncidente,
        fechaIncidente: new Date(fechaIncidente),
        accionesTomadas,
        idUsuarioRegistro,
      },
    });
    return NextResponse.json(incidente, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear incidente', details: error }, { status: 500 });
  }
}

// READ ALL - GET /api/incidents
export async function GET() {
  try {
    const incidentes = await prisma.incidente.findMany({
      where: { registroEstado: true },
      include: {
        categoria: true,
        registradoPor: { select: { idUsuario: true, nombreCompleto: true } },
      },
    });
    return NextResponse.json(incidentes);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener incidentes', details: error }, { status: 500 });
  }
}
