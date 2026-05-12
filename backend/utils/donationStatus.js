/**
 * Donation Lifecycle Status Machine.
 * Defines allowed transitions to ensure data integrity.
 */
const STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  VOLUNTEER_ASSIGNED: 'volunteer_assigned',
  PICKUP_STARTED: 'pickup_started',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
};

const VALID_TRANSITIONS = {
  [STATUSES.PENDING]: [STATUSES.ACCEPTED, STATUSES.VOLUNTEER_ASSIGNED, STATUSES.REJECTED, STATUSES.CANCELLED, STATUSES.EXPIRED],
  [STATUSES.ACCEPTED]: [STATUSES.VOLUNTEER_ASSIGNED, STATUSES.CANCELLED, STATUSES.EXPIRED],
  [STATUSES.VOLUNTEER_ASSIGNED]: [STATUSES.PICKUP_STARTED, STATUSES.CANCELLED, STATUSES.EXPIRED],
  [STATUSES.PICKUP_STARTED]: [STATUSES.PICKED_UP, STATUSES.CANCELLED],
  [STATUSES.PICKED_UP]: [STATUSES.IN_TRANSIT, STATUSES.CANCELLED],
  [STATUSES.IN_TRANSIT]: [STATUSES.DELIVERED, STATUSES.CANCELLED],
  [STATUSES.DELIVERED]: [STATUSES.COMPLETED, STATUSES.CANCELLED],
  [STATUSES.COMPLETED]: [], // Terminal state
  [STATUSES.REJECTED]: [],  // Terminal state
  [STATUSES.EXPIRED]: [],   // Terminal state
  [STATUSES.CANCELLED]: [],  // Terminal state
};

/**
 * Validates if a transition from currentStatus to nextStatus is allowed.
 * @param {string} currentStatus 
 * @param {string} nextStatus 
 * @returns {boolean}
 */
const isValidTransition = (currentStatus, nextStatus) => {
  if (!VALID_TRANSITIONS[currentStatus]) return false;
  return VALID_TRANSITIONS[currentStatus].includes(nextStatus);
};

module.exports = {
  STATUSES,
  isValidTransition,
};
