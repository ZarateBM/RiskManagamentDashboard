import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { userName, userEmail, password } = await request.json();

    if (!userName || !userEmail || !password) {
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

    // Leer plantilla de correo
    const templatePath = path.join(process.cwd(), 'emailtemplates', 'userRegisterTemplate.html');
    let emailTemplate = fs.readFileSync(templatePath, 'utf8');

    // Reemplazar variables en la plantilla
    emailTemplate = emailTemplate
      .replace(/{{userName}}/g, userName)
      .replace(/{{userEmail}}/g, userEmail)
      .replace(/{{password}}/g, password);

    // Enviar correo
    const mailOptions = {
      from: `"Sistema de Gestión de Riesgos" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: 'Bienvenido al Sistema de Gestión de Riesgos',
      html: emailTemplate,
    };

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, messageId: info.messageId },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return NextResponse.json(
      { error: 'Error al enviar correo', details: error },
      { status: 500 }
    );
  }
}