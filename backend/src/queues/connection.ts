import IORedis from 'ioredis';

export const connection = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
  : new IORedis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: null,
    });

connection.on('error', (err) => {
  console.error('Redis connection error:', err);
});
