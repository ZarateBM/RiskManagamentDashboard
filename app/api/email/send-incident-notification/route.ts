import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { 
      incidentTitle,
      incidentDescription,
      incidentCategory,
      incidentSeverity,
      assignedTo,
      assignedEmail,
      riskName,
      protocolName,
      createdBy,
      wasCancelled,
      cancellationReason 
    } = await request.json();

    if (!incidentTitle || !assignedEmail) {
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

    // Obtener fecha y hora de reporte
    const reportTime = new Date().toLocaleString('es-CR', {
      dateStyle: 'full',
      timeStyle: 'medium',
      timeZone: 'America/Costa_Rica'
    });

    // Determinar clase de severidad para estilos
    let severityClass = 'low';
    if (incidentSeverity === 'Crítica') severityClass = 'critical';
    else if (incidentSeverity === 'Alta') severityClass = 'high';
    else if (incidentSeverity === 'Media') severityClass = 'medium';

    // Leer plantilla de correo
    const templatePath = path.join(process.cwd(), 'emailtemplates', 'incidentNotificationTemplate.html');
    let emailTemplate = fs.readFileSync(templatePath, 'utf8');

    // Verificar si tiene riesgo o protocolo
    const hasRisk = !!riskName;
    const hasProtocol = !!protocolName;

    // Reemplazar variables en la plantilla
    emailTemplate = emailTemplate
      .replace(/{{incidentTitle}}/g, incidentTitle)
      .replace(/{{incidentCategory}}/g, incidentCategory || 'No especificada')
      .replace(/{{reportTime}}/g, reportTime)
      .replace(/{{incidentSeverity}}/g, incidentSeverity || 'No especificada')
      .replace(/{{severityClass}}/g, severityClass)
      .replace(/{{assignedTo}}/g, assignedTo || 'No asignado')
      .replace(/{{incidentDescription}}/g, incidentDescription || 'Sin descripción')
      .replace(/{{riskName}}/g, riskName || '')
      .replace(/{{protocolName}}/g, protocolName || '')
      .replace(/{{cancellationReason}}/g, cancellationReason || '')
      .replace(/{{#if hasRisk}}/g, hasRisk ? '' : '<!--')
      .replace(/{{\/if}}/g, hasRisk ? '' : '-->')
      .replace(/{{#if hasProtocol}}/g, hasProtocol ? '' : '<!--')
      .replace(/{{\/if}}/g, hasProtocol ? '' : '-->')
      .replace(/{{#if wasCancelled}}/g, wasCancelled ? '' : '<!--')
      .replace(/{{\/if}}/g, wasCancelled ? '' : '-->');

    // Enviar correo
    const mailOptions = {
      from: `"Sistema de Gestión de Riesgos" <${process.env.SMTP_USER}>`,
      to: assignedEmail,
      subject: `🚨 Nuevo Incidente: ${incidentTitle}`,
      html: emailTemplate,
    };

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, messageId: info.messageId },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al enviar correo de notificación de incidente:', error);
    return NextResponse.json(
      { error: 'Error al enviar correo', details: error },
      { status: 500 }
    );
  }
}