import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendTestEmail } from '@/lib/mail';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || "secret"; // usa una variable de entorno en producción

function createToken(payload: object) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const usuario = await prisma.usuario.findUnique({
      where: { correo: email }
    });

    let isValidCredentials = false;
    if (usuario) {
      isValidCredentials = await bcrypt.compare(password, usuario.contraseña);
    }
    
    // Soporte para credencial hardcodeada (para desarrollo/testing)
    if (email === 'rayo@ucr.ac.cr' && password === 'AdminRiskManager123!') {
      isValidCredentials = true;
    }
    
    if (isValidCredentials) {
      try {
        await sendTestEmail({
          to: email,
          subject: 'Inicio de Sesión Exitoso',
          text: 'Has iniciado sesión correctamente en el Sistema de Gestión de Riesgos.',
        });
      } catch (emailError) {
        console.error('Error al enviar correo de confirmación:', emailError);
      }
      
      let token = "";
      if (usuario) {
        token = createToken({
          id: usuario.idUsuario,
          nombre: usuario.nombreCompleto,
          rol: usuario.rol
        });
      } else {
        // En caso de loguearte con la credencial hardcodeada, define datos mínimos
        token = createToken({
          id: 0,
          nombre: "Usuario Demo",
          rol: "ADMINISTRADOR"
        });
      }
      
      const response = NextResponse.json({
        success: true,
        user: usuario
          ? { id: usuario.idUsuario, nombre: usuario.nombreCompleto, rol: usuario.rol }
          : { id: 0, nombre: "Usuario Demo", rol: "ADMINISTRADOR" }
      });
      
      // Guarda el token en una cookie HTTP-only
      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "strict",
        maxAge: 60 * 60, // 1 hora
      });
      
      return response;
    }
    
    return NextResponse.json(
      { success: false, message: 'Credenciales inválidas' },
      { status: 401 }
    );
    
  } catch (error) {
    console.error('Error en autenticación:', error);
    return NextResponse.json(
      { success: false, error: 'Error de servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}