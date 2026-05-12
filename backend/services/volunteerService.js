const VolunteerSession = require('../models/VolunteerSession');
const AppError = require('../utils/AppError');

/**
 * Volunteer Service — handles session lifecycle and telemetry.
 */

/**
 * Initialize or resume a volunteer session.
 */
const startSession = async (userId, data = {}) => {
  const { lng, lat, deviceInfo } = data;

  const session = await VolunteerSession.findOneAndUpdate(
    { userId },
    {
      status: 'online',
      isAvailable: true,
      lastHeartbeat: new Date(),
      deviceInfo,
      ...(lng && lat && {
        location: { type: 'Point', coordinates: [lng, lat] }
      }),
    },
    { upsert: true, new: true, runValidators: true }
  );

  return session;
};

/**
 * Update volunteer location and heartbeat.
 */
const updateTelemetry = async (userId, lng, lat) => {
  const session = await VolunteerSession.findOne({ userId });
  if (!session) {
    throw new AppError('Active session not found', 404);
  }

  return session.heartbeat(lng, lat);
};

/**
 * Toggle availability for deliveries.
 */
const toggleAvailability = async (userId, isAvailable) => {
  const session = await VolunteerSession.findOneAndUpdate(
    { userId },
    { isAvailable, lastHeartbeat: new Date() },
    { new: true }
  );
  
  if (!session) {
    throw new AppError('Active session not found', 404);
  }

  return session;
};

/**
 * End a volunteer session (Go Offline).
 */
const endSession = async (userId) => {
  return VolunteerSession.findOneAndUpdate(
    { userId },
    { status: 'offline', isAvailable: false, lastHeartbeat: new Date() },
    { new: true }
  );
};

/**
 * Get active volunteers near a coordinate.
 */
const getNearbyVolunteers = async (lng, lat, radiusMeters = 5000) => {
  return VolunteerSession.findNearbyVolunteers(lng, lat, radiusMeters);
};

/**
 * Link a donation to the session.
 */
const assignDonation = async (userId, donationId) => {
  return VolunteerSession.findOneAndUpdate(
    { userId },
    { activeDonationId: donationId, status: 'busy', isAvailable: false },
    { new: true }
  );
};

/**
 * Clear donation from the session.
 */
const clearDonation = async (userId) => {
  return VolunteerSession.findOneAndUpdate(
    { userId },
    { activeDonationId: null, status: 'online', isAvailable: true },
    { new: true }
  );
};

module.exports = {
  startSession,
  updateTelemetry,
  toggleAvailability,
  endSession,
  getNearbyVolunteers,
  assignDonation,
  clearDonation
};
