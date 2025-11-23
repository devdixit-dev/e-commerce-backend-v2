import 'dotenv/config'
import nodemailer from 'nodemailer';
import RedisClient from '../config/redis.config';

import { makeLogFileWRedis } from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: process.env.HOST_URI,
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const SendEmail = async (to: string, subject: string, text: string) => {
  if (!to || !subject || !text) {
    throw new Error('Email params missing !');
  }

  try {
    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to, subject, text
    });

    const key = `email:log:${to}`
    const data = `[${new Date().toISOString()}] Test email sent -> ${to} | Subject: ${subject}`

    await RedisClient.set(key, data, "EX", 60);

    await makeLogFileWRedis("email.log", `${key}`);

    console.log(`Email sent to: ${to}`);
  }
  catch (err) {
    console.error(`Send email error: ${err}`);
    return null
  }
}

export default SendEmail;