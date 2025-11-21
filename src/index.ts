import 'dotenv/config'
import cluster from 'cluster';
import os from 'os';

import createServer from './app';
import connectDatabase from "./config/database.config";


const port = process.env.PORT || 3030;

const startServer = async () => {
  if (cluster.isPrimary) {
    const cpus = os.cpus().length;
    console.log(`Master: ${process.pid}`);
    console.log(`Starting ${cpus} workers...`)

    for (let i = 0; i < cpus; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.error(
        `Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Restarting...`
      );
      cluster.fork();
    });
  } else {
    const app = await createServer();

    app.listen(port, () => {
      console.log(`Worker ${process.pid} started and listening on port ${port}`);
    });

    await connectDatabase();
  }
}

startServer();