import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';

import authRouter from './routes/auth.route';
import UserRouter from './routes/user.route';
import auth from './middlewares/auth.middleware';

const createServer = async () => {
  const app = express();

  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  app.use(express.json());
  app.use(cookieParser());

  app.get('/', async (_, res) => {
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

  app.use('/api/auth', authRouter);
  app.use('/api/user', auth, UserRouter);

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