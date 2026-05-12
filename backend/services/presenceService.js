const User = require('../models/User');
const VolunteerSession = require('../models/VolunteerSession');
const Donation = require('../models/Donation');
const Notification = require('../models/Notification');
const notificationService = require('./notificationService');

/**
 * Presence Service — Handles live status and state synchronization.
 */

/**
 * Update user to 'online' status.
 */
const setOnline = async (userId, socketId) => {
  await User.findByIdAndUpdate(userId, {
    isOnline: true,
    lastSeen: new Date()
  });

  // If volunteer, ensure session is also marked as online
  await VolunteerSession.findOneAndUpdate(
    { userId },
    { status: 'online', socketId, lastHeartbeat: new Date() }
  );
};

/**
 * Update user to 'offline' status.
 */
const setOffline = async (userId) => {
  await User.findByIdAndUpdate(userId, {
    isOnline: false,
    lastSeen: new Date()
  });

  // We don't force VolunteerSession to offline immediately 
  // (the background sweep handles it to allow for quick reconnects).
};

/**
 * Sync payload for reconnecting users.
 * Aggregates all relevant state the frontend needs to recover.
 */
const getSyncData = async (userId, role) => {
  const syncPayload = {
    timestamp: new Date(),
    notifications: [],
    activeDonations: [],
    volunteerSession: null
  };

  // 1. Fetch unread notifications
  syncPayload.notifications = await Notification.find({ userId, read: false })
    .sort('-createdAt')
    .limit(20);

  // 2. Fetch active donations based on role
  const donationFilter = {};
  if (role === 'restaurant') donationFilter.restaurantId = userId;
  if (role === 'ngo') donationFilter.ngoId = userId;
  if (role === 'volunteer') donationFilter.volunteerId = userId;
  
  if (role !== 'admin') {
    donationFilter.status = { $in: ['pending', 'accepted', 'assigned', 'in_transit'] };
    syncPayload.activeDonations = await Donation.find(donationFilter).sort('-updatedAt');
  }

  // 3. Fetch volunteer session details
  if (role === 'volunteer') {
    syncPayload.volunteerSession = await VolunteerSession.findOne({ userId });
  }

  return syncPayload;
};

module.exports = {
  setOnline,
  setOffline,
  getSyncData
};
