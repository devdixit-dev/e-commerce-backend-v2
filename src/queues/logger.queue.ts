import 'dotenv/config';
import { Queue } from 'bullmq';

const loggerQueue = new Queue('loggerQueue',
  {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    }
  },
);

export default loggerQueue;