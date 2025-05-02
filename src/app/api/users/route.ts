import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany()
    return NextResponse.json(usuarios)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { nombreCompleto, correo, contraseña, rol } = await req.json()
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombreCompleto,
        correo,
        contraseña,
        rol,
      },
    })
    return NextResponse.json(nuevoUsuario)
  } catch (error) {
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "Falta parámetro id" }, { status: 400 })
    }
    await prisma.usuario.delete({ where: { idUsuario: parseInt(id) } })
    return NextResponse.json({ message: "Usuario eliminado" })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 })
  }
}