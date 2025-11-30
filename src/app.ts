import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';

import authRouter from './routes/auth.route';
import UserRouter from './routes/user.route';
import auth from './middlewares/auth.middleware';
import upload from './middlewares/multer.middleware';
import User from './models/user.model';

const createServer = async () => {
  const app = express();

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

  app.post("/upload", upload.single('avatar'), async (req, res) => {
    if(!req.file){
      return res.json({
        message: 'File is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      "692880b4bf6e89cc9fad46cb",
      { avatar: req.file.originalname }
    );

    return res.json({
      message: 'File uploaded'
    });
  })

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