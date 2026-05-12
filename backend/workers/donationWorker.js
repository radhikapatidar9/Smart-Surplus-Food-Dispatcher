const { Worker } = require('bullmq');
const { redisConnection } = require('../config/redis');
const Donation = require('../models/Donation');
const Notification = require('../models/Notification');

const donationWorker = new Worker('donations', async (job) => {
  const { type, donationId } = job.data;

  try {
    const donation = await Donation.findById(donationId);
    if (!donation) return;

    if (type === 'expiration') {
      if (donation.status === 'pending') {
        donation.status = 'expired';
        await donation.save();
        console.log(`⏰ Donation ${donationId} has expired.`);
      }
    }

    if (type === 'escalation') {
      if (donation.status === 'pending' && donation.category === 'critical') {
        // Notify all admins about unpicked critical food
        await Notification.create({
          type: 'urgent_escalation',
          message: `🔥 CRITICAL: Donation "${donation.foodType}" has not been picked up after 30 mins!`,
          userId: null, // Broadcast or specific admin IDs
        });
      }
    }
  } catch (err) {
    console.error(`❌ Donation Worker Error [${type}]:`, err.message);
    throw err;
  }
}, { connection: redisConnection });

donationWorker.on('error', (err) => {
  // Silent error - handled by config/redis.js logging
});

module.exports = donationWorker;
