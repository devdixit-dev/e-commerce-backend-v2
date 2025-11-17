import express from 'express';
import RedisClient from './config/redis.config';

const app = express();

app.get('/', async (req, res) => {
  res.json({
    success: true,
    uptime: process.uptime()
  });

  await RedisClient.set('username', 'admin')
  .then(() => { console.log(`Check Redis Username Admin Added`) })
  .catch((e) => { console.log(`Error in adding username admin - ${e}`) });
});

export default app;