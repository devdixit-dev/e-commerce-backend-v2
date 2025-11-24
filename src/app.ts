import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser'

import authRouter from './routes/auth.route';
import UserRouter from './routes/user.route';
import SendEmail from './services/email.service';

const createServer = async () => {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  app.get('/', async (req, res) => {
    res.json({
      success: true,
      uptime: process.uptime(),
      worker: process.pid
    });
  });

  app.use((req, _, next) => {
    console.log(`${req.url} - ${req.method} - ${req.ip}`);
    next();
  });

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/user', UserRouter);

  app.post('/check', (req, res) => {
    const { to, subject, text } = req.body;

    setTimeout(async () => {
      await SendEmail(to, subject, text);
    }, 3000);

    return res.json({
      success: true,
      message: 'Email sent & logged'
    });
  });

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  app.use((_req, res) => {
    res.status(404).json({ error: "Not Found" });
  });

  return app;
}

export default createServer;