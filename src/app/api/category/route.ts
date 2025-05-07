// /app/api/categorias/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Obtener todas las categorías
export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      where: {
        registroEstado: true
      }
    });
    
    return NextResponse.json(categorias, { status: 200 });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return NextResponse.json(
      { error: 'Error al obtener las categorías' },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva categoría
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, descripcion } = body;
    
    // Validación básica
    if (!nombre || !descripcion) {
      return NextResponse.json(
        { error: 'El nombre y la descripción son obligatorios' },
        { status: 400 }
      );
    }
    
    const nuevaCategoria = await prisma.categoria.create({
      data: {
        nombre,
        descripcion,
        registroEstado: true
      }
    });
    
    return NextResponse.json(nuevaCategoria, { status: 201 });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    return NextResponse.json(
      { error: 'Error al crear la categoría' },
      { status: 500 }
    );
  }
}

// /app/api/categorias/[id]/route.ts
// El archivo debe estar en esta ruta para manejar los parámetros de ID

// GET - Obtener una categoría por ID
export async function GETID(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de categoría inválido' },
        { status: 400 }
      );
    }
    
    const categoria = await prisma.categoria.findUnique({
      where: {
        idCategoria: id,
        registroEstado: true
      }
    });
    
    if (!categoria) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(categoria, { status: 200 });
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    return NextResponse.json(
      { error: 'Error al obtener la categoría' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar una categoría
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de categoría inválido' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { nombre, descripcion } = body;
    
    // Validación básica
    if (!nombre || !descripcion) {
      return NextResponse.json(
        { error: 'El nombre y la descripción son obligatorios' },
        { status: 400 }
      );
    }
    
    // Verificar que la categoría existe
    const categoriaExistente = await prisma.categoria.findUnique({
      where: {
        idCategoria: id,
        registroEstado: true
      }
    });
    
    if (!categoriaExistente) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }
    
    // Actualizar la categoría
    const categoriaActualizada = await prisma.categoria.update({
      where: {
        idCategoria: id
      },
      data: {
        nombre,
        descripcion
      }
    });
    
    return NextResponse.json(categoriaActualizada, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la categoría' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar lógicamente una categoría (cambiar registroEstado a false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de categoría inválido' },
        { status: 400 }
      );
    }
    
    // Verificar que la categoría existe
    const categoriaExistente = await prisma.categoria.findUnique({
      where: {
        idCategoria: id,
        registroEstado: true
      }
    });
    
    if (!categoriaExistente) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }
    
    // Eliminación lógica (cambiar registroEstado a false)
    const categoriaEliminada = await prisma.categoria.update({
      where: {
        idCategoria: id
      },
      data: {
        registroEstado: false
      }
    });
    
    return NextResponse.json(
      { message: 'Categoría eliminada correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la categoría' },
      { status: 500 }
    );
  }
}