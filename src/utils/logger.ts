import path from 'path';
import fs from 'fs';
import RedisClient from '../config/redis.config';

const makeLogFile = async (filename: string, key: string) => {
  try {
    const data = await RedisClient.get(key) || '';

    const logsDir = path.join(process.cwd(), "logs");

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const logFile = path.join(logsDir, filename);

    fs.appendFileSync(logFile, JSON.parse(data), 'utf-8');

    console.log(`Email sent. Logged`);
  }
  catch (error) {
    console.error(`Making log file error - ${error}`);
    return null
  }
}