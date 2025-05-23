// app/api/risk/route.ts
import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '../email/route'   // helper que usa nodemailer

const prisma = new PrismaClient()

type RiesgoRequestBody = {
  titulo: string
  descripcion?: string           // descripción opcional en el payload
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
      },
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

  let nuevo
  try {
    nuevo = await prisma.riesgo.create({
      data: {
        titulo,
        idCategoria,
        impacto,
        probabilidad,
        estado,
        responsableId,
        idUsuarioRegistro,
      },
      include: {
        planesMitigar: true,
        planesEvitar: true,
      },
    })
  } catch (dbError) {
    console.error('Error creando riesgo:', dbError)
    return NextResponse.json(
      { error: 'Error interno al crear el riesgo.' },
      { status: 500 }
    )
  }
  (async () => {
    try {
      const responsable = await prisma.usuario.findUnique({
        where: { idUsuario: responsableId },
      })
      if (!responsable?.correo) {
        console.warn(`Usuario ${responsableId} no tiene correo.`)
        return
      }

      const asignacionFecha = new Date().toLocaleDateString('es-CR')
      const mitigarList = nuevo.planesMitigar
        .map(p => `• ${p.nombre}`).join('<br>')
      const evitarList = nuevo.planesEvitar
        .map(p => `• ${p.nombre}`).join('<br>')
      const planesHtml = (mitigarList || evitarList)
        ? `<p><b>Planes asignados:</b><br>${mitigarList}<br>${evitarList}</p>`
        : '<p><i>Sin PLANES asignados por el momento.</i></p>'

      await sendEmail({
        to: responsable.correo,
        subject: `Nuevo riesgo asignado: ${nuevo.titulo} (ID: ${nuevo.idRiesgo})`,
        html: `
          <h2>Notificación de Nuevo Riesgo</h2>
          <p>Hola ${responsable.nombreCompleto},</p>
          <p>Se te ha asignado un nuevo riesgo para su seguimiento.</p>
          <p>
            <b>Título:</b> ${nuevo.titulo}<br>
            <b>ID:</b> ${nuevo.idRiesgo}<br>
            <b>Fecha de asignación:</b> ${asignacionFecha}
          </p>
          ${planesHtml}
          <hr>
          <p>Por favor ingresa al sistema para más detalles.</p>
        `,
      })
    } catch (emailError) {
      console.error('Error enviando correo de riesgo:', emailError)
    }
  })()

  return NextResponse.json(nuevo, { status: 201 })
}