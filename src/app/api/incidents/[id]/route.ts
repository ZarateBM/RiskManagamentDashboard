// api/incidents/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from '@/lib/mail';

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
      include: {
        categoria: true,
        registradoPor: true,
      },
    })

    // Enviar correo
    try {
      const usuario = actualizado.registradoPor
      const fecha = new Date().toLocaleDateString('es-CR')

      await sendEmail({
        to: usuario?.correo || 'soporte@sistema.com',
        subject: `Actualización de incidente: ${actualizado.titulo}`,
        html: `
          <h2>Incidente Actualizado</h2>
          <p><b>Título:</b> ${actualizado.titulo}</p>
          <p><b>Estado:</b> ${actualizado.estadoIncidente}</p>
          <p><b>Descripción:</b> ${actualizado.descripcion || 'No disponible'}</p>
          <p><b>Fecha del incidente:</b> ${actualizado.fechaIncidente?.toLocaleDateString('es-CR') || 'No especificada'}</p>
          <p><b>Categoría:</b> ${actualizado.categoria?.nombre || 'Sin categoría'}</p>
          <p><b>Registrado por:</b> ${usuario?.nombreCompleto || 'Desconocido'} (${usuario?.correo || 'sin correo'})</p>
          <p><b>Fecha de actualización:</b> ${fecha}</p>
          <hr/>
          <p>Consulta más detalles en el sistema de gestión de incidentes.</p>
        `,
        text: `El incidente "${actualizado.titulo}" fue actualizado. Estado: ${actualizado.estadoIncidente || 'No disponible'}.`,
      })
    } catch (mailError) {
      console.error('Error al enviar correo de actualización:', mailError)
    }

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