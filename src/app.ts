import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';

import authRouter from './routes/auth.route';
import auth from './middlewares/auth.middleware';
import { makeLogFile } from './utils/logger';
import productRouter from './routes/product.route';
import userRouter from './routes/user.route';

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
    makeLogFile("track.log", `[${Date.now()}] - ${req.url} | ${req.method} | ${req.ip} | ${req.headers["user-agent"]}`)
    console.log(`${req.url} - ${req.method} - ${req.ip}`);
    next();
  });

  app.use('/api/auth', authRouter);
  app.use('/api/user', auth, userRouter);
  app.use('/api/products', productRouter)

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