// app/api/risk/route.ts
import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

type RiesgoRequestBody = {
  titulo: string
  idCategoria: number
  impacto: string
  probabilidad: string
  estado: string
  responsableId: number
  idUsuarioRegistro: number
  registroEstado?: boolean // Opcional porque puede ser gestionado por default
}

// GET /api/risk
export async function GET() {
  const riesgos = await prisma.riesgo.findMany({
    include: {
      categoria: true,
      responsable: true,
      registradoPor: true,
      planesMitigar: true,
      planesEvitar: true,
    }
  })
  return NextResponse.json(riesgos)
}

// POST /api/risk

export async function POST(req: NextRequest) {
    let body: RiesgoRequestBody
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { error: 'JSON inválido en el cuerpo de la petición.' },
        { status: 400 }
      )
    }
  
    // Campos obligatorios
    const {
      titulo,
      idCategoria,
      impacto,
      probabilidad,
      estado,
      responsableId,
      idUsuarioRegistro,
    } = body
  
    // Validación sencilla
    if (
      typeof titulo !== 'string' ||
      !Number.isInteger(idCategoria) ||
      typeof impacto !== 'string' ||
      typeof probabilidad !== 'string' ||
      typeof estado !== 'string' ||
      !Number.isInteger(responsableId) ||
      !Number.isInteger(idUsuarioRegistro)
    ) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios o tienen un tipo incorrecto.' },
        { status: 400 }
      )
    }
  
    try {
      const nuevo = await prisma.riesgo.create({
        data: {
          titulo,
          idCategoria,
          impacto,
          probabilidad,
          estado,
          responsableId,
          idUsuarioRegistro,
        },
      })
      return NextResponse.json(nuevo, { status: 201 })
    } catch (e: unknown) {
      console.error('Error al crear riesgo:', e)
      return NextResponse.json(
        { error: 'Error interno al crear el riesgo.' },
        { status: 500 }
      )
    }
  }

// PUT /api/risk
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = Number(searchParams.get('id'))
  if (!id) return NextResponse.json({ error: 'ID no válido' }, { status: 400 })

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

// DELETE /api/risk
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = Number(searchParams.get('id'))
  if (!id) return NextResponse.json({ error: 'ID no válido' }, { status: 400 })

  await prisma.riesgo.delete({ where: { idRiesgo: id } })
  return new Response(null, { status: 204 })
}
