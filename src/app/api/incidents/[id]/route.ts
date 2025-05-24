// api/incidents/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
function extractId(request: NextRequest): number {
  const url = new URL(request.url)
  const segments = url.pathname.split('/')
  const last = segments[segments.length - 1]
  const id = parseInt(last, 10)
  if (isNaN(id)) {
    throw new Error(`Invalid id segment: "${last}"`)
  }
  return id
}

// GET /api/incidents/:id
export async function GET(request: NextRequest) {
  let id: number
  try {
    id = extractId(request)
  } catch {
    return NextResponse.json({ error: 'ID inválido en la ruta' }, { status: 400 })
  }

  try {
    const incidente = await prisma.incidente.findUnique({
      where: { idIncidente: id, registroEstado: true },
      include: { categoria: true, registradoPor: true },
    })
    if (!incidente) {
      return NextResponse.json({ error: 'Incidente no encontrado' }, { status: 404 })
    }
    return NextResponse.json(incidente)
  } catch (error) {
    console.error('Error fetching incidente:', error)
    return NextResponse.json(
      { error: 'Error al obtener incidente' },
      { status: 500 }
    )
  }
}

// PUT /api/incidents/:id
export async function PUT(request: NextRequest) {
  let id: number
  try {
    id = extractId(request)
  } catch {
    return NextResponse.json({ error: 'ID inválido en la ruta' }, { status: 400 })
  }

  let data: {
    titulo?: string
    descripcion?: string
    idCategoria?: number
    impacto?: string
    probabilidad?: string
    estado?: string
    responsableId?: number
    idUsuarioRegistro?: number
    fechaIncidente?: string
  }
  try {
    data = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  try {
    const actualizado = await prisma.incidente.update({
      where: { idIncidente: id },
      data: {
        ...data,
        fechaIncidente: data.fechaIncidente
          ? new Date(data.fechaIncidente)
          : undefined,
      },
    })
    return NextResponse.json(actualizado)
  } catch (error) {
    console.error('Error updating incidente:', error)
    return NextResponse.json(
      { error: 'Error al actualizar incidente' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  let id: number
  try {
    id = extractId(request)
  } catch {
    return NextResponse.json({ error: 'ID inválido en la ruta' }, { status: 400 })
  }

  try {
    const eliminado = await prisma.incidente.update({
      where: { idIncidente: id },
      data: { registroEstado: false },
    })
    return NextResponse.json(
      { message: 'Incidente eliminado (soft delete)', incidente: eliminado }
    )
  } catch (error) {
    console.error('Error deleting incidente:', error)
    return NextResponse.json(
      { error: 'Error al eliminar incidente' },
      { status: 500 }
    )
  }
}