const Donation = require('../models/Donation');
const AppError = require('../utils/AppError');
const { STATUSES, isValidTransition } = require('../utils/donationStatus');
const logisticsService = require('./logisticsService');
const { scheduleExpiration, scheduleEscalation } = require('../queues');
const notificationService = require('./notificationService');
const VolunteerSession = require('../models/VolunteerSession');

/**
 * Donation Service — handles all logistics business logic.
 */

/**
 * Fetch donations with advanced filtering.
 * @param {Object} query - Query parameters from request
 * @returns {Promise<Object>} Results and metadata
 */
const getAllDonations = async (query) => {
  const { status, category, restaurantId, ngoId, volunteerId, sort = '-createdAt', limit = 100, page = 1 } = query;
  
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (restaurantId) filter.restaurantId = restaurantId;
  if (ngoId) filter.ngoId = ngoId;
  if (volunteerId) filter.volunteerId = volunteerId;

  const skip = (page - 1) * limit;

  const donations = await Donation.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('restaurantId', 'name email avatar')
    .populate('ngoId', 'name email avatar')
    .populate('volunteerId', 'name email avatar');

  const total = await Donation.countDocuments(filter);

  return { donations, total, page, limit };
};

/**
 * Get a single donation by ID with full details.
 * @param {string} id - Donation ID
 * @returns {Promise<Object>} Donation document
 */
const getDonationById = async (id) => {
  const donation = await Donation.findById(id)
    .populate('restaurantId', 'name email location avatar')
    .populate('ngoId', 'name email location avatar')
    .populate('volunteerId', 'name email avatar');

  if (!donation) {
    throw new AppError('Donation not found', 404);
  }

  return donation;
};

/**
 * Create a new food donation and notify relevant NGOs.
 * @param {Object} data - Donation data
 * @param {Object} user - Authenticated restaurant user
 * @returns {Promise<Object>} Created donation
 */
const createDonation = async (data, user) => {
  const { 
    foodType, quantity, unit, category, location, lat, lng, 
    expiresIn, notes, imageUrl 
  } = data;

  const donation = await Donation.create({
    foodType,
    quantity,
    unit: unit || 'kg',
    category: category || 'standard',
    location,
    lat: lat || 0,
    lng: lng || 0,
    expiresIn: expiresIn || (category === 'critical' ? '2 hours' : '6 hours'),
    notes: notes || '',
    foodImage: imageUrl || '',
    restaurantId: user._id,
    restaurantName: user.name,
  });

  // Schedule Background Jobs
  if (process.env.NODE_ENV !== 'test') {
    const delay = new Date(donation.expiresAt).getTime() - Date.now();
    if (delay > 0) {
      await scheduleExpiration(donation._id, delay);
    }

    if (donation.category === 'critical') {
      await scheduleEscalation(donation._id);
    }
  }

  // 5. Notify all NGOs about the new donation
  await notificationService.notifyRole('ngo', {
    type: donation.category === 'critical' ? 'critical' : 'new_donation',
    priority: donation.category === 'critical' ? 'critical' : 'standard',
    message: donation.category === 'critical'
      ? `⚡ Urgent: ${quantity} ${unit || 'kg'} of ${foodType} needs pickup!`
      : `🍛 New donation: ${foodType} from ${user.name}`,
    link: `/tracking/${donation._id}`,
    metadata: { donationId: donation._id }
  });

  return donation;
};

/**
 * Update donation status and trigger notifications.
 * @param {string} id - Donation ID
 * @param {Object} updateData - Status, IDs, notes
 * @param {Object} actor - The user performing the update
 * @returns {Promise<Object>} Updated donation
 */
const updateStatus = async (id, updateData, actor) => {
  const { status, ngoId, volunteerId, note } = updateData;
  const donation = await Donation.findById(id);

  if (!donation) {
    throw new AppError('Donation not found', 404);
  }

  // 1. Validate State Transition
  if (!isValidTransition(donation.status, status)) {
    throw new AppError(`Invalid status transition: ${donation.status} -> ${status}`, 400);
  }

  // 2. Map Status to Timestamps & Logic
  donation.status = status;
  
  if (!donation.delivery) donation.delivery = {};

  switch (status) {
    case STATUSES.ACCEPTED:
      if (ngoId) {
        donation.ngoId = ngoId;
        donation.acceptedAt = new Date();
      }
      break;

    case STATUSES.VOLUNTEER_ASSIGNED:
      if (ngoId) {
        donation.ngoId = ngoId;
        donation.acceptedAt = new Date();
      }
      if (volunteerId) {
        donation.volunteerId = volunteerId;
        if (!donation.volunteerAssignment) donation.volunteerAssignment = {};
        donation.volunteerAssignment.assignedAt = new Date();
        donation.volunteerAssignment.assignedBy = actor._id;
      }
      break;

    case STATUSES.PICKUP_STARTED:
      donation.delivery.pickupStartedAt = new Date();
      // Calculate ETA from volunteer to pickup (restaurant)
      if (donation.volunteerId) {
        const session = await VolunteerSession.findOne({ userId: donation.volunteerId });
        if (session && session.location) {
          const etaData = await logisticsService.calculateDeliveryETA(
            session.location.coordinates,
            donation.pickupPoint.coordinates
          );
          if (etaData) {
            donation.delivery.eta = etaData.eta;
            donation.delivery.estimatedDurationMin = Math.round(etaData.eta / 60000);
          }
        }
      }
      break;

    case STATUSES.PICKED_UP:
      donation.delivery.pickedUpAt = new Date();
      break;

    case STATUSES.IN_TRANSIT:
      donation.delivery.transitStartedAt = new Date();
      // Calculate ETA from current position to dropoff (NGO)
      if (donation.volunteerId && donation.dropoffPoint) {
        const session = await VolunteerSession.findOne({ userId: donation.volunteerId });
        if (session && session.location) {
          const etaData = await logisticsService.calculateDeliveryETA(
            session.location.coordinates,
            donation.dropoffPoint.coordinates
          );
          if (etaData) {
            donation.delivery.eta = etaData.eta;
          }
        }
      }
      break;

    case STATUSES.DELIVERED:
      donation.delivery.deliveredAt = new Date();
      break;

    case STATUSES.COMPLETED:
      donation.delivery.completedAt = new Date();
      break;
  }

  // 3. Add timeline event
  donation.addTimelineEvent(status, actor._id, actor.role, note);

  await donation.save();

  // 4. Notification logic
  const statusMessages = {
    [STATUSES.VOLUNTEER_ASSIGNED]: `✅ A volunteer has been assigned to your donation "${donation.foodType}"`,
    [STATUSES.PICKUP_STARTED]: `🚴 Volunteer is on the way to pick up "${donation.foodType}"`,
    [STATUSES.PICKED_UP]: `📦 Your donation "${donation.foodType}" has been picked up`,
    [STATUSES.IN_TRANSIT]: `🛣️ Your donation "${donation.foodType}" is in transit to the destination`,
    [STATUSES.DELIVERED]: `🎉 Your donation "${donation.foodType}" has been delivered! Waiting for completion.`,
    [STATUSES.COMPLETED]: `🎊 Delivery of "${donation.foodType}" is officially completed! Thank you.`,
  };

  if (statusMessages[status]) {
    await notificationService.notifyUser(donation.restaurantId, {
      type: status,
      priority: 'standard',
      message: statusMessages[status],
      link: `/tracking/${donation._id}`,
      metadata: { donationId: donation._id }
    });
  }

  return donation;
};

/**
 * Find donations near a coordinate.
 * @param {number} lng
 * @param {number} lat
 * @param {number} distanceKm
 * @returns {Promise<Array>}
 */
const getNearbyDonations = async (lng, lat, distanceKm = 10) => {
  return Donation.findNearby(lng, lat, distanceKm * 1000, { status: 'pending' });
};

/**
 * Delete a donation (only if it's not in progress).
 * @param {string} id
 * @param {string} userId
 */
const deleteDonation = async (id, userId) => {
  const donation = await Donation.findById(id);
  if (!donation) {
    throw new AppError('Donation not found', 404);
  }

  // Check ownership
  if (donation.restaurantId.toString() !== userId.toString()) {
    throw new AppError('Not authorized to delete this donation', 403);
  }

  // Check if in progress
  if (['accepted', 'assigned', 'in_transit'].includes(donation.status)) {
    throw new AppError('Cannot delete a donation that is already in progress', 400);
  }

  await donation.deleteOne();
};

module.exports = {
  getAllDonations,
  getDonationById,
  createDonation,
  updateStatus,
  getNearbyDonations,
  deleteDonation,
};
