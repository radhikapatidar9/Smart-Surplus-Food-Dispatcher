const { Worker } = require('bullmq');
const { redisConnection } = require('../config/redis');
const VolunteerSession = require('../models/VolunteerSession');

const volunteerWorker = new Worker('volunteers', async (job) => {
  const { type, userId } = job.data;

  try {
    if (type === 'inactivity_check') {
      const session = await VolunteerSession.findOne({ userId });
      if (session && session.isTimedOut(15)) { // 15 mins
        session.status = 'offline';
        session.isAvailable = false;
        await session.save();
        console.log(`👤 Volunteer ${userId} marked offline due to inactivity.`);
      }
    }
  } catch (err) {
    console.error(`❌ Volunteer Worker Error:`, err.message);
    throw err;
  }
}, { connection: redisConnection });

volunteerWorker.on('error', (err) => {
  // Silent error - handled by config/redis.js logging
});

module.exports = volunteerWorker;
