import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * Helper para extraer el último segmento de la URL y convertirlo a number.
 */
function parseId(request: Request): number | null {
  const url = new URL(request.url)
  const parts = url.pathname.split('/')
  const raw = parts[parts.length - 1]
  const num = Number(raw)
  return Number.isNaN(num) ? null : num
}

// GET – Obtener una categoría por ID
export async function GET(request: Request): Promise<NextResponse> {
  const id = parseId(request)
  if (id === null) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }
  try {
    const categoria = await prisma.categoria.findUnique({
      where: { idCategoria: id, registroEstado: true },
    })
    if (!categoria) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
    }
    return NextResponse.json(categoria, { status: 200 })
  } catch (error) {
    console.error('Error al obtener categoría:', error)
    return NextResponse.json(
      { error: 'Error al obtener la categoría' },
      { status: 500 }
    )
  }
}

// PUT – Actualizar una categoría por ID
export async function PUT(request: Request): Promise<NextResponse> {
  const id = parseId(request)
  if (id === null) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }
  try {
    const { nombre, descripcion } = await request.json()
    if (!nombre || !descripcion) {
      return NextResponse.json(
        { error: 'El nombre y la descripción son obligatorios' },
        { status: 400 }
      )
    }
    const existe = await prisma.categoria.findUnique({
      where: { idCategoria: id, registroEstado: true },
    })
    if (!existe) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
    }
    const actualizada = await prisma.categoria.update({
      where: { idCategoria: id },
      data: { nombre, descripcion },
    })
    return NextResponse.json(actualizada, { status: 200 })
  } catch (error) {
    console.error('Error al actualizar categoría:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la categoría' },
      { status: 500 }
    )
  }
}

// DELETE – Eliminar lógicamente (registroEstado = false)
export async function DELETE(request: Request): Promise<NextResponse> {
  const id = parseId(request)
  if (id === null) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }
  try {
    const existe = await prisma.categoria.findUnique({
      where: { idCategoria: id, registroEstado: true },
    })
    if (!existe) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
    }
    await prisma.categoria.update({
      where: { idCategoria: id },
      data: { registroEstado: false },
    })
    return NextResponse.json(
      { message: 'Categoría eliminada correctamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error al eliminar categoría:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la categoría' },
      { status: 500 }
    )
  }
}
