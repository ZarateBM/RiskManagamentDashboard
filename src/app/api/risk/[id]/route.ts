// app/api/risk/[id]/route.ts

import { sendEmail } from '@/lib/mail'
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
    const riesgoPrevio = await prisma.riesgo.findUnique({
      where: { idRiesgo: id },
    })

    if (!riesgoPrevio) {
      return NextResponse.json({ error: 'Riesgo no encontrado' }, { status: 404 })
    }

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
      include: {
        planesMitigar: true,
        planesEvitar: true,
      },
    })

    // Si el estado cambió, enviar correo
    if (body.estado && body.estado !== riesgoPrevio.estado) {
      try {
        const responsable = await prisma.usuario.findUnique({
          where: { idUsuario: updated.responsableId },
        })

        if (responsable?.correo) {
          const fechaCambio = new Date().toLocaleDateString('es-CR')
          const mitigarList = updated.planesMitigar.map(p => `• ${p.nombre}`).join('<br>')
          const evitarList = updated.planesEvitar.map(p => `• ${p.nombre}`).join('<br>')
          const planesHtml = (mitigarList || evitarList)
            ? `<p><b>Planes asignados:</b><br>${mitigarList}<br>${evitarList}</p>`
            : '<p><i>Sin PLANES asignados por el momento.</i></p>'

          await sendEmail({
            to: responsable.correo,
            subject: `Cambio de estado del riesgo: ${updated.titulo} (ID: ${updated.idRiesgo})`,
            text: `El estado del riesgo "${updated.titulo}" (ID: ${updated.idRiesgo}) ha sido cambiado a "${updated.estado}".`,
            html: `
              <h2>Actualización de Estado de Riesgo</h2>
              <p>Hola ${responsable.nombreCompleto},</p>
              <p>Se ha actualizado el estado del riesgo asignado a ti.</p>
              <p>
                <b>Título:</b> ${updated.titulo}<br>
                <b>ID:</b> ${updated.idRiesgo}<br>
                <b>Nuevo estado:</b> ${updated.estado}<br>
                <b>Fecha de cambio:</b> ${fechaCambio}
              </p>
              ${planesHtml}
              <hr>
              <p>Por favor revisa el sistema para más información.</p>
            `,
          })
        } else {
          console.warn(`Usuario ${updated.responsableId} no tiene correo.`)
        }
      } catch (emailError) {
        console.error('Error enviando correo por cambio de estado:', emailError)
      }
    }

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
