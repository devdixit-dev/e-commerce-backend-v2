import 'dotenv/config'
import nodemailer from 'nodemailer';
import RedisClient from '../config/redis.config';

import makeLogFile from '../utils/logger';

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

    await makeLogFile("email.log", `${key}`)

    // const logsDir = path.join(process.cwd(), "logs");

    // if (!fs.existsSync(logsDir)) {
    //   fs.mkdirSync(logsDir, { recursive: true });
    // }

    // const logFile = path.join(logsDir, "email.log");

    // const logEntry = `\n[${new Date().toISOString()}] Email sent -> ${to} | Subject: ${subject}`;

    // fs.appendFileSync(logFile, logEntry, 'utf-8');

    console.log(`Email sent to: ${to}`);
  }
  catch (err) {
    console.error(`Send email error: ${err}`);
    return null
  }
}

export default SendEmail;