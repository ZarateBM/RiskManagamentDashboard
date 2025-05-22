// api/incidents/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// READ ONE - GET /api/incidents/:id
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  try {
    const incidente = await prisma.incidente.findUnique({
      where: { idIncidente: id, registroEstado: true },
      include: {
        categoria: true,
        registradoPor: true,
      },
    });
    if (!incidente) {
      return NextResponse.json({ error: 'Incidente no encontrado' }, { status: 404 });
    }
    return NextResponse.json(incidente);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener incidente', details: error }, { status: 500 });
  }
}

// UPDATE - PUT /api/incidents/:id
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const data = await req.json();

  try {
    const incidente = await prisma.incidente.update({
      where: { idIncidente: id },
      data: {
        ...data,
        fechaIncidente: data.fechaIncidente ? new Date(data.fechaIncidente) : undefined,
      },
    });
    return NextResponse.json(incidente);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar incidente', details: error }, { status: 500 });
  }
}

// DELETE (soft delete) - DELETE /api/incidents/:id
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  try {
    const incidente = await prisma.incidente.update({
      where: { idIncidente: id },
      data: { registroEstado: false },
    });
    return NextResponse.json({ message: 'Incidente eliminado (soft delete)', incidente });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar incidente', details: error }, { status: 500 });
  }
}
