const IORedis = require('ioredis');

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
  lazyConnect: true, // Don't connect immediately
};

const redisConnection = new IORedis(redisConfig);
let isConnected = false;

// Silently catch connection errors to avoid crashing the app
redisConnection.on('connect', () => {
  isConnected = true;
});

redisConnection.on('error', (err) => {
  isConnected = false;
  // Only log once to avoid spamming the console
  if (!global.redisErrorLogged) {
    console.warn('⚠️  Redis not found or connection failed. Background workers/queues will be disabled.');
    global.redisErrorLogged = true;
  }
});

const isRedisConnected = () => isConnected;

module.exports = { redisConnection, redisConfig, isRedisConnected };
