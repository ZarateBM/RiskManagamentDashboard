// app/api/email/route.ts

import nodemailer from 'nodemailer'
import path from 'path'

export type EmailPayload = {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailPayload) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  await transporter.sendMail({
    from: `"Tu Sistema" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    attachments: [
      {
        filename: 'firma-tipografica-ucr.svg',
        path: path.join(process.cwd(), 'public', 'firma-tipografica-ucr.svg'),
        cid: 'firma',
      },
    ],
  })
}
