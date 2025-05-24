// app/api/risk/[id]/route.ts

import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()


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

// GET /api/risk/:id
export async function GET(request: NextRequest) {
  let id: number
  try {
    id = extractId(request)
  } catch {
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
      },
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

// PUT /api/risk/:id
export async function PUT(request: NextRequest) {
  let id: number
  try {
    id = extractId(request)
  } catch {
    return NextResponse.json({ error: 'ID no válido' }, { status: 400 })
  }

  let body: {
    titulo?: string
    idCategoria?: number
    impacto?: string
    probabilidad?: string
    estado?: string
    responsableId?: number
    idUsuarioRegistro?: number
    registroEstado?: boolean
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  try {
    const updated = await prisma.riesgo.update({
      where: { idRiesgo: id },
      data: {
        titulo:           body.titulo,
        idCategoria:      body.idCategoria,
        impacto:          body.impacto,
        probabilidad:     body.probabilidad,
        estado:           body.estado,
        responsableId:    body.responsableId,
        idUsuarioRegistro:body.idUsuarioRegistro,
        registroEstado:   body.registroEstado,
      },
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error('Error updating riesgo:', e)
    return NextResponse.json({ error: 'Error al actualizar riesgo' }, { status: 500 })
  }
}

// DELETE /api/risk/:id
export async function DELETE(request: NextRequest) {
  let id: number
  try {
    id = extractId(request)
  } catch {
    return NextResponse.json({ error: 'ID no válido' }, { status: 400 })
  }

  try {
    await prisma.riesgo.delete({ where: { idRiesgo: id } })
    // 204 No Content
    return new Response(null, { status: 204 })
  } catch (e) {
    console.error('Error deleting riesgo:', e)
    return NextResponse.json({ error: 'Error interno al eliminar riesgo' }, { status: 500 })
  }
}
