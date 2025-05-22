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
}

// GET /api/risk
export async function GET() {
  try {
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
  } catch (e) {
    console.error('Error fetching riesgos:', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST /api/risk
export async function POST(req: NextRequest) {
  let body: RiesgoRequestBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const {
    titulo,
    idCategoria,
    impacto,
    probabilidad,
    estado,
    responsableId,
    idUsuarioRegistro,
  } = body

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
      { error: 'Faltan campos obligatorios o con tipo incorrecto.' },
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
  } catch (e) {
    console.error('Error al crear riesgo:', e)
    return NextResponse.json(
      { error: 'Error interno al crear el riesgo.' },
      { status: 500 }
    )
  }
}
