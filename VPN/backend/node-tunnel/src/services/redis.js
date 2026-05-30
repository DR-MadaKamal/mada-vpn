const Redis = require('ioredis');

function createRedisClient() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  client.on('error', (err) => {
    console.error(`Redis error: ${err.message}`);
  });

  client.on('connect', () => {
    console.log('Connected to Redis');
  });

  client.connect().catch((err) => {
    console.warn(`Redis connection failed (non-fatal): ${err.message}`);
  });

  return client;
}

module.exports = { createRedisClient };
