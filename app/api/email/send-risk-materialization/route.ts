import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { 
      riskName,
      riskCategory,
      eventDescription,
      realSeverity,
      reportedBy,
      responsibleName,
      responsibleEmail,
      protocolName,
      hasProtocol
    } = await request.json();

    if (!riskName || !eventDescription || !realSeverity || !responsibleEmail) {
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

    // Obtener fecha y hora de materialización
    const materializationTime = new Date().toLocaleString('es-CR', {
      dateStyle: 'full',
      timeStyle: 'medium',
      timeZone: 'America/Costa_Rica'
    });

    // Determinar clase de severidad para estilos
    let severityClass = 'low';
    if (realSeverity === 'Crítica') severityClass = 'critical';
    else if (realSeverity === 'Alta') severityClass = 'high';
    else if (realSeverity === 'Media') severityClass = 'medium';

    // Leer plantilla de correo
    const templatePath = path.join(process.cwd(), 'emailtemplates', 'riskMaterializationTemplate.html');
    let emailTemplate = fs.readFileSync(templatePath, 'utf8');

    // Reemplazar variables en la plantilla
    emailTemplate = emailTemplate
      .replace(/{{riskName}}/g, riskName)
      .replace(/{{riskCategory}}/g, riskCategory)
      .replace(/{{materializationTime}}/g, materializationTime)
      .replace(/{{eventDescription}}/g, eventDescription)
      .replace(/{{realSeverity}}/g, realSeverity)
      .replace(/{{severityClass}}/g, severityClass)
      .replace(/{{reportedBy}}/g, reportedBy)
      .replace(/{{protocolName}}/g, protocolName || '')
      .replace(/{{#if hasProtocol}}/g, hasProtocol ? '' : '<!--')
      .replace(/{{\/if}}/g, hasProtocol ? '' : '-->');

    // Enviar correo
    const mailOptions = {
      from: `"Sistema de Gestión de Riesgos" <${process.env.SMTP_USER}>`,
      to: responsibleEmail,
      subject: `🚨 ALERTA: Materialización de Riesgo - ${riskName}`,
      html: emailTemplate,
    };

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, messageId: info.messageId },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al enviar correo de notificación de materialización:', error);
    return NextResponse.json(
      { error: 'Error al enviar correo', details: error },
      { status: 500 }
    );
  }
}