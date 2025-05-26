// api/incidents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from '@/lib/mail';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const data = await req.json()
  const {
    idCategoria,
    titulo,
    severidad,
    descripcion,
    estadoIncidente,
    fechaIncidente,
    accionesTomadas,
    idUsuarioRegistro,
    responsableId, 
  } = data

  try {
    const incidente = await prisma.incidente.create({
      data: {
        idCategoria,
        titulo,
        severidad,
        descripcion,
        estadoIncidente,
        fechaIncidente: new Date(fechaIncidente),
        accionesTomadas,
        idUsuarioRegistro,
        responsableId, 
        
      },
      include: {
        categoria: true,
        registradoPor: true,
      },
    })

    // Enviar correo
    try {
      const fecha = new Date().toLocaleDateString('es-CR')
      const usuario = incidente.registradoPor

      await sendEmail({
        to: usuario?.correo,
        subject: `Nuevo incidente registrado: ${titulo}`,
        text: `Se ha registrado un nuevo incidente con título: "${titulo}".`,
        html: `
          <h2>Nuevo Incidente Registrado</h2>
          <p><b>Título:</b> ${titulo}</p>
          <p><b>Severidad:</b> ${severidad}</p>
          <p><b>Estado:</b> ${estadoIncidente}</p>
          <p><b>Fecha del incidente:</b> ${new Date(fechaIncidente).toLocaleDateString('es-CR')}</p>
          <p><b>Descripción:</b> ${descripcion}</p>
          <p><b>Acciones tomadas:</b> ${accionesTomadas || 'Ninguna'}</p>
          <p><b>Categoría:</b> ${incidente.categoria?.nombre || 'Sin categoría'}</p>
          <p><b>Registrado por:</b> ${usuario?.nombreCompleto || 'Usuario desconocido'} (${usuario?.correo || 'sin correo'})</p>
          <p><b>Fecha de registro:</b> ${fecha}</p>
          <hr />
          <p>Consulta más detalles en el sistema de gestión de incidentes.</p>
        `,
      })
    } catch (mailError) {
      console.error('Error al enviar correo de incidente:', mailError)
    }

    return NextResponse.json(incidente, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear incidente', details: error },
      { status: 500 }
    )
  }
}
// READ ALL - GET /api/incidents
export async function GET() {
  try {
    const incidentes = await prisma.incidente.findMany({
      where: { registroEstado: true },
      include: {
        categoria: true,
        registradoPor: { select: { idUsuario: true, nombreCompleto: true } },
      },
    });
    return NextResponse.json(incidentes);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener incidentes', details: error }, { status: 500 });
  }
}
