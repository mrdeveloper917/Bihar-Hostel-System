
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

export async function sendMail(opts) {
  // opts: { to, subject, text, html }
  if (!transporter) return;
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || 'noreply@biharhostel.local',
      ...opts
    });
    console.log('mail sent', info.messageId);
    return info;
  } catch (e) {
    console.warn('mail error', e.message);
  }
}
