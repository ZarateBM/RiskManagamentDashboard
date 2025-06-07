import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { userName, userEmail } = await request.json();

    if (!userName || !userEmail) {
      return NextResponse.json(
        { error: 'Datos incompletos para el envío del correo' },
        { status: 400 }
      );
    }

    // Configurar transporter para nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Obtener fecha y hora actual
    const loginTime = new Date().toLocaleString('es-CR', {
      dateStyle: 'full',
      timeStyle: 'medium',
      timeZone: 'America/Costa_Rica'
    });

    // Intentar obtener IP (esto es opcional, depende de tu configuración)
    let ipAddress = 'No disponible';
    try {
      // En producción, podrías obtenerla del encabezado de la solicitud
      const forwardedFor = request.headers.get('x-forwarded-for');
      if (forwardedFor) {
        ipAddress = forwardedFor.split(',')[0].trim();
      } else {
        ipAddress = request.headers.get('x-real-ip') || 'No disponible';
      }
    } catch (e) {
      console.error('Error al obtener IP:', e);
    }

    // Leer plantilla de correo
    const templatePath = path.join(process.cwd(), 'emailtemplates', 'loginNotificationTemplate.html');
    let emailTemplate = fs.readFileSync(templatePath, 'utf8');

    // Reemplazar variables en la plantilla
    emailTemplate = emailTemplate
      .replace(/{{userName}}/g, userName)
      .replace(/{{loginTime}}/g, loginTime)
      .replace(/{{ipAddress}}/g, ipAddress);

    // Enviar correo
    const mailOptions = {
      from: `"Sistema de Gestión de Riesgos" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: 'Notificación de inicio de sesión - Sistema de Gestión de Riesgos',
      html: emailTemplate,
    };

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, messageId: info.messageId },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al enviar correo de notificación de inicio de sesión:', error);
    return NextResponse.json(
      { error: 'Error al enviar correo', details: error },
      { status: 500 }
    );
  }
}