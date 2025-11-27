import { Worker } from 'bullmq';
import { makeLogFile } from '../utils/logger';

const worker = new Worker(
  'loggerQueue',
  async (job) => {
    console.log(`[worker] got job id=${job.id} name=${job.name}`);
    makeLogFile(job.data.filename, job.data.entry)
  },
  {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    },
    concurrency: 1
  }
);

worker.on("completed", (job) => {
  console.log(`[worker:${job.id}] completed`);
});

worker.on("failed", (job, error) => {
  console.error(`[worker:${job?.id}] failed, ${error.message}`);
});

worker.on('error', (err) => {
  console.error('[worker] error', err);
});