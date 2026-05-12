const { Queue } = require('bullmq');
const { redisConnection, isRedisConnected } = require('../config/redis');

// Initialize Queues (Skip in tests or if Redis is missing to avoid connection errors)
let donationQueue, notificationQueue, volunteerQueue;

const isTest = process.env.NODE_ENV === 'test';

if (!isTest) {
  // Real queues
  donationQueue = new Queue('donations', { connection: redisConnection });
  notificationQueue = new Queue('notifications', { connection: redisConnection });
  volunteerQueue = new Queue('volunteers', { connection: redisConnection });

  // Add error listeners to prevent unhandled rejections
  donationQueue.on('error', () => {});
  notificationQueue.on('error', () => {});
  volunteerQueue.on('error', () => {});
} else {
  // Mock queues for testing
  const mockQueue = { 
    add: async () => { console.log('📦 Queue Mock: Job added (Redis bypassed)'); },
    on: () => {} 
  };
  donationQueue = mockQueue;
  notificationQueue = mockQueue;
  volunteerQueue = mockQueue;
}

/**
 * Schedule a donation expiration job.
 */
const scheduleExpiration = async (donationId, delayMs) => {
  try {
    if (!isTest && !isRedisConnected()) {
      console.log(`⚠️  Redis disconnected. Skipping expiration job for ${donationId}`);
      return;
    }
    await donationQueue.add('expire', 
      { type: 'expiration', donationId }, 
      { delay: delayMs, removeOnComplete: true }
    );
  } catch (err) {
    console.error(`❌ Failed to schedule expiration: ${err.message}`);
  }
};

/**
 * Schedule an urgent escalation check.
 */
const scheduleEscalation = async (donationId) => {
  try {
    if (!isTest && !isRedisConnected()) {
      console.log(`⚠️  Redis disconnected. Skipping escalation job for ${donationId}`);
      return;
    }
    await donationQueue.add('escalate', 
      { type: 'escalation', donationId }, 
      { delay: 30 * 60 * 1000, removeOnComplete: true } // 30 mins
    );
  } catch (err) {
    console.error(`❌ Failed to schedule escalation: ${err.message}`);
  }
};

module.exports = {
  donationQueue,
  notificationQueue,
  volunteerQueue,
  scheduleExpiration,
  scheduleEscalation
};
