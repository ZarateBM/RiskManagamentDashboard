// lib/mail.js
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: true, // Cambiado a true porque el puerto 465 utiliza SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export function getUserRegistrationEmailTemplate(userName: string, userEmail: string, password: string) {
  const templatePath = path.join(process.cwd(), 'src', 'emailTemplates', 'userRegisterTemplate.html');
  let template = fs.readFileSync(templatePath, 'utf-8');
  template = template.replace(/{{userName}}/g, userName)
                     .replace(/{{userEmail}}/g, userEmail)
                     .replace(/{{password}}/g, password);
  return template;
}

export async function sendTestEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  try {
    await transporter.sendMail({
      from: `"Sistema de Riesgos" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });
    console.log("Email sent successfully to:", to);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

export async function sendEmail({ 
  to, 
  subject, 
  text, 
  html 
}: { 
  to: string; 
  subject: string; 
  text: string; 
  html?: string; 
}) {
  try {
    await transporter.sendMail({
      from: `"Sistema de Riesgos" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html: html || undefined,
    });
    console.log("Email sent successfully to:", to);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
