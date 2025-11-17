import 'dotenv/config'

import app from "./app";
import connectDatabase from "./config/database.config";
import RedisClient from "./config/redis.config";

const port = process.env.PORT || 3030;

const start = async () => {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });

  await connectDatabase();
}

start();