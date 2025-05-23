import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"
import { sendEmail, getUserRegistrationEmailTemplate } from "@/lib/mail"

export async function GET() {
  try {
    // Excluir las contraseñas de la respuesta por seguridad
    const usuarios = await prisma.usuario.findMany({
      select: {
        idUsuario: true,
        nombreCompleto: true,
        correo: true,
        rol: true,
        mitigador: true,
        fechaCreacion: true,
        registroEstado: true,
        contraseña: false, // Excluimos la contraseña
      }
    })
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
    const { nombreCompleto, correo, contraseña, rol, mitigador = false } = await req.json()
    
    // Guardar la contraseña original para enviarla por correo
    const originalPassword = contraseña;
    
    // Hashear la contraseña con bcrypt (10 rondas de salt)
    const hashedPassword = await bcrypt.hash(contraseña, 10)
    
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombreCompleto,
        correo,
        contraseña: hashedPassword, // Guardamos la contraseña hasheada
        rol,
        mitigador,
      },
    })
    
    // Enviar correo electrónico de bienvenida con credenciales
    try {
      const htmlContent = getUserRegistrationEmailTemplate(nombreCompleto, correo, originalPassword);
      await sendEmail({
        to: correo,
        subject: 'Bienvenido al Sistema de Gestión de Riesgos',
        text: `Hola ${nombreCompleto}, tu cuenta ha sido creada exitosamente. Tu correo: ${correo} y tu contraseña: ${originalPassword}`,
        html: htmlContent
      });
    } catch (emailError) {
      console.error('Error al enviar correo de bienvenida:', emailError);
    }
    
    // No devolver la contraseña en la respuesta
    const { ...usuarioSinContraseña } = nuevoUsuario
    return NextResponse.json(usuarioSinContraseña)
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