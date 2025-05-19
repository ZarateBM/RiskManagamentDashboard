import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET – Obtener todas las categorías
export async function GET(): Promise<NextResponse> {
  try {
    const categorias = await prisma.categoria.findMany({
      where: { registroEstado: true },
    })
    return NextResponse.json(categorias, { status: 200 })
  } catch (error) {
    console.error('Error al obtener categorías:', error)
    return NextResponse.json(
      { error: 'Error al obtener las categorías' },
      { status: 500 }
    )
  }
}

// POST – Crear una nueva categoría
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { nombre, descripcion } = await request.json()
    if (!nombre || !descripcion) {
      return NextResponse.json(
        { error: 'El nombre y la descripción son obligatorios' },
        { status: 400 }
      )
    }
    const nuevaCategoria = await prisma.categoria.create({
      data: { nombre, descripcion, registroEstado: true },
    })
    return NextResponse.json(nuevaCategoria, { status: 201 })
  } catch (error) {
    console.error('Error al crear categoría:', error)
    return NextResponse.json(
      { error: 'Error al crear la categoría' },
      { status: 500 }
    )
  }
}
