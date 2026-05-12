const mongoose = require('mongoose');

// ─── GeoJSON Point Sub-Schema ────────────────────────────────────────────────
const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
  },
  coordinates: {
    type: [Number],       // [longitude, latitude]
    required: true,
  },
}, { _id: false });

// ─── Volunteer Session Schema ────────────────────────────────────────────────
const volunteerSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,         // One active session per user
    index: true,
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'away', 'busy'],
    default: 'offline',
    index: true,
  },
  location: {
    type: pointSchema,
    index: '2dsphere',    // Geospatial index for dispatcher queries
  },
  isAvailable: {
    type: Boolean,
    default: false,
    index: true,
  },
  activeDonationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    default: null,
  },
  lastHeartbeat: {
    type: Date,
    default: Date.now,
    index: true,
  },
  socketId: {
    type: String,
    default: null,
  },
  deviceInfo: {
    os: String,
    browser: String,
    ip: String,
  },
  // Statistics for current session
  sessionStats: {
    startTime: { type: Date, default: Date.now },
    totalDistanceKm: { type: Number, default: 0 },
    deliveriesCount: { type: Number, default: 0 },
  }
}, { timestamps: true });

// ─── Indexes ─────────────────────────────────────────────────────────────────

// For finding available volunteers near a pickup point
volunteerSessionSchema.index({ isAvailable: 1, status: 1, location: '2dsphere' });

// ─── Instance Methods ───────────────────────────────────────────────────────

/**
 * Update volunteer heartbeat and location.
 */
volunteerSessionSchema.methods.heartbeat = function(lng, lat) {
  this.lastHeartbeat = new Date();
  if (lng !== undefined && lat !== undefined) {
    this.location = {
      type: 'Point',
      coordinates: [lng, lat],
    };
  }
  return this.save();
};

/**
 * Check if the session has timed out (e.g. 5 minutes).
 */
volunteerSessionSchema.methods.isTimedOut = function(minutes = 5) {
  const diff = Date.now() - this.lastHeartbeat.getTime();
  return diff > minutes * 60 * 1000;
};

// ─── Static Methods ─────────────────────────────────────────────────────────

/**
 * Find active volunteers near a location.
 */
volunteerSessionSchema.statics.findNearbyVolunteers = function(lng, lat, maxDistanceMeters = 5000) {
  return this.find({
    status: 'online',
    isAvailable: true,
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: maxDistanceMeters,
      },
    },
  }).populate('userId', 'name email avatar');
};

/**
 * Cleanup stale sessions.
 */
volunteerSessionSchema.statics.cleanupStaleSessions = function(minutes = 10) {
  const threshold = new Date(Date.now() - minutes * 60 * 1000);
  return this.updateMany(
    { lastHeartbeat: { $lt: threshold }, status: { $ne: 'offline' } },
    { $set: { status: 'offline', isAvailable: false } }
  );
};

module.exports = mongoose.model('VolunteerSession', volunteerSessionSchema);
