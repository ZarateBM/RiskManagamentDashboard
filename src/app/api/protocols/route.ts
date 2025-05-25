import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const protocolos = await prisma.protocolo.findMany({
      select: {
        idProtocolo: true,
        nombre: true,
        descripcion: true,
        categoria: true,
        severidad: true,
        tiempoEstimado: true,
        herramientas: true,
        pasos: true,
        fechaPublicacion: true,
        registroEstado: true,
        publicadoPor: {
          select: {
            idUsuario: true,
            nombreCompleto: true,
            correo: true
          }
        }
      }
    })
    return NextResponse.json(protocolos)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error al obtener protocolos:", error.message)
    }
    return NextResponse.json(
      { error: "Error al obtener protocolos" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const {
      nombre,
      descripcion,
      categoria,
      severidad,
      tiempoEstimado,
      herramientas,
      pasos,
      idUsuarioPublicador
    } = await req.json()

    const nuevoProtocolo = await prisma.protocolo.create({
      data: {
        nombre,
        descripcion,
        categoria,
        severidad,
        tiempoEstimado,
        herramientas,
        pasos,
        idUsuarioPublicador,
        fechaPublicacion: new Date()
      }
    })

    return NextResponse.json(nuevoProtocolo)
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint failed")) {
      return NextResponse.json(
        { error: "Protocolo ya existe" },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Error al crear protocolo" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json(
        { error: "Falta parámetro id" },
        { status: 400 }
      )
    }

    await prisma.protocolo.delete({
      where: { idProtocolo: parseInt(id) }
    })

    return NextResponse.json({ message: "Protocolo eliminado" })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      return NextResponse.json(
        { error: "Protocolo no encontrado" },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: "Error al eliminar protocolo" },
      { status: 500 }
    )
  }
}