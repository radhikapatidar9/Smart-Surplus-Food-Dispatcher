const VolunteerSession = require('../models/VolunteerSession');
const { getDistances, getRouteDetails } = require('../utils/googleMaps');

/**
 * Logistics Service — Advanced route and matching logic.
 */

/**
 * Find the best volunteer for a donation based on actual travel time.
 * @param {Array<number>} pickupCoords - [lng, lat]
 * @returns {Promise<Object>} Best volunteer session and travel stats
 */
const findBestVolunteer = async (pickupCoords) => {
  // 1. Get pool of nearby candidates (within 10km straight-line)
  const candidates = await VolunteerSession.findNearbyVolunteers(
    pickupCoords[0], 
    pickupCoords[1], 
    10000 
  );

  if (candidates.length === 0) return null;

  // 2. Use Distance Matrix to find the truly nearest by driving time
  const origins = candidates.map(c => c.location.coordinates);
  const matrix = await getDistances(origins, pickupCoords);

  if (!matrix) return candidates[0]; // Fallback to geospatial if API fails

  // 3. Find the one with minimum duration
  let minIdx = 0;
  let minDuration = Infinity;

  matrix.forEach((item, idx) => {
    if (item.status === 'OK' && item.duration.value < minDuration) {
      minDuration = item.duration.value;
      minIdx = idx;
    }
  });

  return {
    session: candidates[minIdx],
    travelStats: matrix[minIdx]
  };
};

/**
 * Calculate ETA and polyline for a delivery in progress.
 * @param {Array<number>} currentCoords - [lng, lat]
 * @param {Array<number>} targetCoords - [lng, lat]
 * @returns {Promise<Object>} ETA, Distance, and Route
 */
const calculateDeliveryETA = async (currentCoords, targetCoords) => {
  const details = await getRouteDetails(currentCoords, targetCoords);
  if (!details) return null;

  return {
    eta: new Date(Date.now() + (details.durationValue * 1000)),
    duration: details.durationText,
    distance: details.distanceText,
    polyline: details.polyline
  };
};

module.exports = {
  findBestVolunteer,
  calculateDeliveryETA
};
