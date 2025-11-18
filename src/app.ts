import express from 'express';

import RedisClient from './config/redis.config';
import authRouter from './routes/auth.route';
import UserRouter from './routes/user.route';

const app = express();

app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.url} - ${req.method} - ${req.ip}`);
  next();
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', UserRouter);

app.get('/', async (req, res) => {
  res.json({
    success: true,
    uptime: process.uptime()
  });

  await RedisClient.set('username', 'admin')
  console.log(`Redis: set username admin`)
});

export default app;