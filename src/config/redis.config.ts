import 'dotenv/config'
import Redis from 'ioredis';

const RedisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  db: 0,

  retryStrategy(times) {
    const delay = Math.min(times * 2000, 2000);
    return delay;
  },
});

RedisClient.on('connect', async () => {
  console.log(`Redis connected`);
});

RedisClient.on('error', (err) => {
  console.error(`Redis error: ${err}`);
});

export default RedisClient;