import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { 
      riskName,
      newState,
      responsibleName,
      responsibleEmail,
      changedBy
    } = await request.json();

    if (!riskName || !newState || !responsibleEmail) {
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

    // Obtener fecha y hora del cambio
    const changeTime = new Date().toLocaleString('es-CR', {
      dateStyle: 'full',
      timeStyle: 'medium',
      timeZone: 'America/Costa_Rica'
    });

    // Leer plantilla de correo
    const templatePath = path.join(process.cwd(), 'emailtemplates', 'riskStateChangeTemplate.html');
    let emailTemplate = fs.readFileSync(templatePath, 'utf8');

    // Reemplazar variables en la plantilla
    emailTemplate = emailTemplate
      .replace(/{{riskName}}/g, riskName)
      .replace(/{{newState}}/g, newState)
      .replace(/{{responsibleName}}/g, responsibleName || '')
      .replace(/{{changeTime}}/g, changeTime)
      .replace(/{{changedBy}}/g, changedBy || '');

    // Enviar correo
    const mailOptions = {
      from: `"Sistema de Gestión de Riesgos" <${process.env.SMTP_USER}>`,
      to: responsibleEmail,
      subject: `🔔 Cambio de estado del riesgo: ${riskName}`,
      html: emailTemplate,
    };

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, messageId: info.messageId },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al enviar correo de cambio de estado:', error);
    return NextResponse.json(
      { error: 'Error al enviar correo', details: error },
      { status: 500 }
    );
  }
}