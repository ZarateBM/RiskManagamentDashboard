// app/api/risk/[id]/route.ts
import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

type RiesgoUpdateBody = {
  titulo?: string
  idCategoria?: number
  impacto?: string
  probabilidad?: string
  estado?: string
  responsableId?: number
  idUsuarioRegistro?: number
  registroEstado?: boolean
}

// GET /api/risk/{id}
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = Number(searchParams.get('id'))
  if (!id) {
    return NextResponse.json({ error: 'ID no válido' }, { status: 400 })
  }

  try {
    const riesgo = await prisma.riesgo.findUnique({
      where: { idRiesgo: id },
      include: {
        categoria: true,
        responsable: true,
        registradoPor: true,
        planesMitigar: true,
        planesEvitar: true,
      }
    })
    if (!riesgo) {
      return NextResponse.json({ error: 'Riesgo no encontrado' }, { status: 404 })
    }
    return NextResponse.json(riesgo)
  } catch (e) {
    console.error('Error fetching riesgo:', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// PUT /api/risk/{id}
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10)
  if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  const body = await req.json()
  const updated = await prisma.riesgo.update({
    where: { idRiesgo: id },
    data: {
      titulo: body.titulo,
      idCategoria: body.idCategoria,
      impacto: body.impacto,
      probabilidad: body.probabilidad,
      estado: body.estado,
      responsableId: body.responsableId,
      idUsuarioRegistro: body.idUsuarioRegistro,
      registroEstado: body.registroEstado,
    }
  })
  return NextResponse.json(updated)
}
// DELETE /api/risk/{id}
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = Number(searchParams.get('id'))
  if (!id) {
    return NextResponse.json({ error: 'ID no válido' }, { status: 400 })
  }

  try {
    await prisma.riesgo.delete({ where: { idRiesgo: id } })
    return new Response(null, { status: 204 })
  } catch (e) {
    console.error('Error al eliminar riesgo:', e)
    return NextResponse.json(
      { error: 'Error interno al eliminar el riesgo.' },
      { status: 500 }
    )
  }
}
