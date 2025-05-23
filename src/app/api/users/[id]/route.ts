import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function DELETE(
  request: NextRequest, 
  {params}: { params: Promise<{ id: string; }> } ) {
    const { id } = await params;
    const userId = parseInt(id, 10);
    try {
        await prisma.usuario.delete({
        where: { idUsuario: userId },
        })
        return NextResponse.json({ message: "Usuario eliminado" })
    } catch (error) {
        if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 })
    }
}