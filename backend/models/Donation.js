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
    default: [0, 0],
  },
}, { _id: false });

// ─── Timeline Event Sub-Schema ───────────────────────────────────────────────
const timelineEventSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  actorRole: {
    type: String,
    enum: ['restaurant', 'ngo', 'volunteer', 'admin', 'system'],
  },
  note: {
    type: String,
    default: '',
  },
}, { _id: false });

// ─── AI Audit Sub-Schema ─────────────────────────────────────────────────────
const aiAuditSchema = new mongoose.Schema({
  analyzedAt: {
    type: Date,
  },
  qualityScore: {
    type: Number,        // 0–100 quality rating
    min: 0,
    max: 100,
  },
  category: {
    type: String,        // AI-determined category (e.g. "perishable", "cooked", "dry_goods")
  },
  shelfLifeEstimate: {
    type: Number,        // estimated remaining shelf life in minutes
  },
  flags: {
    type: [String],      // e.g. ["temperature_sensitive", "allergen_present", "near_expiry"]
    default: [],
  },
  confidence: {
    type: Number,        // 0–1 confidence score of AI analysis
    min: 0,
    max: 1,
  },
  model: {
    type: String,        // AI model identifier (e.g. "gemini-2.5-pro-vision")
  },
  rawResponse: {
    type: mongoose.Schema.Types.Mixed,  // full AI response for debugging
  },
}, { _id: false });

// ─── Notification Tracking Sub-Schema ────────────────────────────────────────
const notificationRecordSchema = new mongoose.Schema({
  channel: {
    type: String,
    enum: ['socket', 'push', 'email', 'sms'],
    required: true,
  },
  sentTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,        // e.g. "new_donation", "status_change", "expiry_warning"
  },
  acknowledged: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

// ─── Main Donation Schema ────────────────────────────────────────────────────
const donationSchema = new mongoose.Schema({

  // ── Core Food Information ─────────────────────────────────────────────────
  foodType: {
    type: String,
    required: [true, 'Food type is required'],
    trim: true,
    index: true,
  },
  quantity: {
    type: String,
    required: [true, 'Quantity is required'],
  },
  unit: {
    type: String,
    default: 'kg',
    enum: ['kg', 'lbs', 'servings', 'packets', 'boxes', 'trays', 'liters', 'units'],
  },
  category: {
    type: String,
    enum: ['critical', 'standard'],
    default: 'standard',
    index: true,
  },
  notes: {
    type: String,
    default: '',
    maxlength: 1000,
  },

  // ── Status & Lifecycle ────────────────────────────────────────────────────
  status: {
    type: String,
    enum: [
      'pending', 
      'accepted',
      'volunteer_assigned', 
      'pickup_started', 
      'picked_up', 
      'in_transit', 
      'delivered', 
      'completed', 
      'rejected', 
      'expired', 
      'cancelled'
    ],
    default: 'pending',
    index: true,
  },

  // ── Location — backward-compatible + GeoJSON ──────────────────────────────
  location: {
    type: String,
    required: [true, 'Location address is required'],
  },
  lat: {
    type: Number,
    default: 0,
  },
  lng: {
    type: Number,
    default: 0,
  },
  pickupPoint: {
    type: pointSchema,    // GeoJSON for pickup (restaurant)
  },
  dropoffPoint: {
    type: pointSchema,    // GeoJSON for dropoff (NGO/destination)
  },

  // ── Expiration & Time Sensitivity ─────────────────────────────────────────
  expiresIn: {
    type: String,
    default: '6 hours',   // human-readable, preserved for backward compat
  },
  expiresAt: {
    type: Date,           // computed absolute expiration timestamp
    index: true,
  },
  preparedAt: {
    type: Date,           // when the food was originally prepared
  },

  // ── Restaurant (Donor) ────────────────────────────────────────────────────
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Restaurant ID is required'],
    index: true,
  },
  restaurantName: {
    type: String,
    required: [true, 'Restaurant name is required'],
  },

  // ── NGO (Receiver) ───────────────────────────────────────────────────────
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  acceptedAt: {
    type: Date,
  },

  // ── Volunteer (Delivery) ──────────────────────────────────────────────────
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  volunteerAssignment: {
    assignedAt: { type: Date },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    acceptedByVolunteer: { type: Boolean, default: false },
    volunteerResponseAt: { type: Date },
    currentLocation: pointSchema,
    lastLocationUpdate: { type: Date },
  },

  // ── Delivery Tracking ─────────────────────────────────────────────────────
  delivery: {
    aiVerifiedAt: { type: Date },
    pickupStartedAt: { type: Date },
    pickedUpAt: { type: Date },
    transitStartedAt: { type: Date },
    deliveredAt: { type: Date },
    completedAt: { type: Date },
    distanceKm: { type: Number },
    estimatedDurationMin: { type: Number },
    eta: { type: Date },
    actualDurationMin: { type: Number },
    proofOfDelivery: {
      photoUrl: { type: String },
      signature: { type: String },
      confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      confirmedAt: { type: Date },
    },
  },

  // ── Timeline History ──────────────────────────────────────────────────────
  timeline: {
    type: [timelineEventSchema],
    default: [],
  },

  // ── AI Quality Audit ──────────────────────────────────────────────────────
  aiAudit: {
    type: aiAuditSchema,
    default: null,
  },

  // ── Notification Tracking ─────────────────────────────────────────────────
  notifications: {
    type: [notificationRecordSchema],
    default: [],
    select: false,       // excluded from queries by default (can be heavy)
  },

  // ── Metadata ──────────────────────────────────────────────────────────────
  priority: {
    type: Number,
    default: 0,          // higher = more urgent, computed from category + expiresAt
    index: true,
  },
  tags: {
    type: [String],      // flexible tags: "vegetarian", "halal", "gluten-free", etc.
    default: [],
  },
  cancelReason: {
    type: String,
    default: '',
  },

}, { timestamps: true });

// ─── Indexes ─────────────────────────────────────────────────────────────────

// Geospatial index for nearby-donor queries
donationSchema.index({ pickupPoint: '2dsphere' });

// Geospatial index for dropoff proximity queries
donationSchema.index({ dropoffPoint: '2dsphere' });

// Compound index for common dashboard queries
donationSchema.index({ status: 1, category: 1, createdAt: -1 });

// TTL-like query support: find expiring donations
donationSchema.index({ expiresAt: 1, status: 1 });

// Volunteer dispatch: find unassigned donations near a location
donationSchema.index({ status: 1, volunteerId: 1, pickupPoint: '2dsphere' });

// ─── Pre-save Hooks ─────────────────────────────────────────────────────────

donationSchema.pre('save', function (next) {
  // Sync lat/lng into GeoJSON pickupPoint for backward compatibility
  if (this.isModified('lat') || this.isModified('lng')) {
    if (this.lat !== 0 || this.lng !== 0) {
      this.pickupPoint = {
        type: 'Point',
        coordinates: [this.lng, this.lat],  // GeoJSON: [lng, lat]
      };
    }
  }

  // Compute absolute expiresAt from expiresIn string if not already set
  if (this.isNew && !this.expiresAt && this.expiresIn) {
    const match = this.expiresIn.match(/^(\d+)\s*(hour|hours|min|mins|minute|minutes|day|days)$/i);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();
      const ms = unit.startsWith('hour') ? value * 3600000
               : unit.startsWith('min') ? value * 60000
               : unit.startsWith('day') ? value * 86400000
               : 0;
      if (ms > 0) {
        this.expiresAt = new Date(Date.now() + ms);
      }
    }
  }

  // Compute priority: critical + sooner expiry = higher priority
  if (this.isModified('category') || this.isModified('expiresAt')) {
    let p = this.category === 'critical' ? 100 : 0;
    if (this.expiresAt) {
      const hoursLeft = (this.expiresAt.getTime() - Date.now()) / 3600000;
      if (hoursLeft <= 1) p += 50;
      else if (hoursLeft <= 3) p += 30;
      else if (hoursLeft <= 6) p += 10;
    }
    this.priority = p;
  }

  // Auto-push timeline event on status change
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
    });
  }

  next();
});

// ─── Instance Methods ───────────────────────────────────────────────────────

/**
 * Check if the donation has expired.
 * @returns {boolean}
 */
donationSchema.methods.isExpired = function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

/**
 * Compute remaining time until expiration.
 * @returns {{ hours: number, minutes: number, expired: boolean }}
 */
donationSchema.methods.timeRemaining = function () {
  if (!this.expiresAt) return { hours: 0, minutes: 0, expired: false };
  const diff = this.expiresAt.getTime() - Date.now();
  if (diff <= 0) return { hours: 0, minutes: 0, expired: true };
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    expired: false,
  };
};

/**
 * Add a timeline event manually (useful from controllers).
 * @param {string} status
 * @param {string} actorId
 * @param {string} actorRole
 * @param {string} note
 */
donationSchema.methods.addTimelineEvent = function (status, actorId, actorRole, note = '') {
  this.timeline.push({
    status,
    timestamp: new Date(),
    actor: actorId,
    actorRole,
    note,
  });
};

/**
 * Update volunteer's live location during delivery.
 * @param {number} longitude
 * @param {number} latitude
 */
donationSchema.methods.updateVolunteerLocation = function (longitude, latitude) {
  if (!this.volunteerAssignment) this.volunteerAssignment = {};
  this.volunteerAssignment.currentLocation = {
    type: 'Point',
    coordinates: [longitude, latitude],
  };
  this.volunteerAssignment.lastLocationUpdate = new Date();
};

// ─── Static Methods ─────────────────────────────────────────────────────────

/**
 * Find donations near a point (for volunteer dispatch).
 * @param {number} longitude
 * @param {number} latitude
 * @param {number} maxDistanceMeters - default 10km
 * @param {Object} additionalFilters - extra query filters
 * @returns {Promise<Array>}
 */
donationSchema.statics.findNearby = function (longitude, latitude, maxDistanceMeters = 10000, additionalFilters = {}) {
  return this.find({
    pickupPoint: {
      $near: {
        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
        $maxDistance: maxDistanceMeters,
      },
    },
    ...additionalFilters,
  });
};

/**
 * Find donations that are expiring soon.
 * @param {number} withinMinutes - default 60
 * @returns {Promise<Array>}
 */
donationSchema.statics.findExpiringSoon = function (withinMinutes = 60) {
  const now = new Date();
  const cutoff = new Date(now.getTime() + withinMinutes * 60000);
  return this.find({
    expiresAt: { $gte: now, $lte: cutoff },
    status: { $in: ['pending', 'accepted', 'assigned'] },
  }).sort({ expiresAt: 1 });
};

/**
 * Find donations that have expired but aren't marked as such.
 * @returns {Promise<Array>}
 */
donationSchema.statics.findExpired = function () {
  return this.find({
    expiresAt: { $lte: new Date() },
    status: { $nin: ['delivered', 'expired', 'cancelled', 'rejected'] },
  });
};

// ─── Virtuals ────────────────────────────────────────────────────────────────

/**
 * Virtual field: is the donation currently active (not terminal state)?
 */
donationSchema.virtual('isActive').get(function () {
  return !['delivered', 'expired', 'cancelled', 'rejected'].includes(this.status);
});

/**
 * Virtual field: is a volunteer currently assigned?
 */
donationSchema.virtual('hasVolunteer').get(function () {
  return this.volunteerId != null;
});

// Ensure virtuals appear in JSON output
donationSchema.set('toJSON', { virtuals: true });
donationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Donation', donationSchema);
