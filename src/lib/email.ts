// lib/email.ts
import nodemailer from 'nodemailer';

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: EmailPayload) {
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465, 
  secure: true, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

  await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
}
