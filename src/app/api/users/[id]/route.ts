import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    await prisma.usuario.delete({
      where: { idUsuario: id },
    })
    return NextResponse.json({ message: "Usuario eliminado" })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 })
  }
}