const socketAuth = require('../middlewares/socketAuth');
const volunteerService = require('../services/volunteerService');
const presenceService = require('../services/presenceService');
const donationService = require('../services/donationService');

/**
 * Socket Manager — Structured Real-time Logistics
 */
module.exports = (io) => {
  // Use Authentication Middleware
  io.use(socketAuth);

  io.on('connection', (socket) => {
    const { user } = socket;
    const userId = user._id.toString();

    console.log(`🔌 Connected: ${user.name} (${user.role}) | ID: ${socket.id}`);

    // Update Presence: Online
    presenceService.setOnline(userId, socket.id);

    // Send Sync Payload (Reconnect Synchronization)
    presenceService.getSyncData(userId, user.role).then(syncData => {
      socket.emit('sync_state', syncData);
    });

    // 1. Private User Room (for direct notifications)
    socket.join(`user:${userId}`);

    // 2. Role-Based Room (for broad announcements like 'new_donation')
    socket.join(`role:${user.role}`);

    // 3. Donation-Specific Rooms
    socket.on('subscribe_donation', (donationId, callback) => {
      socket.join(`donation:${donationId}`);
      console.log(`📦 User ${userId} joined room donation:${donationId}`);
      if (callback) callback({ success: true, message: `Joined donation:${donationId}` });
    });

    socket.on('unsubscribe_donation', (donationId) => {
      socket.leave(`donation:${donationId}`);
    });

    // ─── Logistics Events ──────────────────────────────────────────────────

    /**
     * Volunteer Location Updates.
     * Targeted: Only emitted to the specific donation room.
     */
    socket.on('location_update', async (data, callback) => {
      const { lng, lat, donationId } = data;

      try {
        // Update DB session telemetry (if volunteer)
        if (user.role === 'volunteer') {
          await volunteerService.updateTelemetry(userId, lng, lat);
        }

        const payload = {
          userId,
          lng,
          lat,
          timestamp: new Date()
        };

        // Broadcast ONLY to the specific donation room (Restaurant & NGO)
        if (donationId) {
          io.to(`donation:${donationId}`).emit('delivery_location', payload);
        }

        // Acknowledge receipt to the sender
        if (callback) callback({ success: true, timestamp: new Date() });

      } catch (err) {
        console.error('Socket telemetry error:', err.message);
        if (callback) callback({ success: false, error: err.message });
      }
    });

    /**
     * Real-time Status Synchronization.
     * Validates and persists lifecycle transitions with acknowledgement.
     */
    socket.on('status_update', async (data, callback) => {
      try {
        const { donationId, status, note } = data;
        
        // Use service to validate and persist (handles timestamps & timeline)
        const donation = await donationService.updateStatus(donationId, { status, note }, user);

        const room = `donation:${donationId}`;
        
        // Sync to the specific donation room
        io.to(room).emit('donation_updated', donation);
        
        // Sync to private user rooms for involved parties
        io.to(`user:${donation.restaurantId}`).emit('donation_status_update', donation);
        if (donation.ngoId) io.to(`user:${donation.ngoId}`).emit('donation_status_update', donation);

        if (callback) callback({ success: true, status: donation.status });

      } catch (err) {
        console.error('Socket status update error:', err.message);
        if (callback) callback({ success: false, error: err.message });
      }
    });

    /**
     * Heartbeat System.
     * Keeps volunteer sessions alive and tracks availability.
     */
    socket.on('heartbeat', async (data, callback) => {
      try {
        if (user.role === 'volunteer') {
          await volunteerService.updateTelemetry(userId, data.lng, data.lat);
        }
        if (callback) callback({ status: 'alive', time: new Date() });
      } catch (err) {
        if (callback) callback({ status: 'error', message: err.message });
      }
    });

    // ─── Connection Lifecycle ──────────────────────────────────────────────

    socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected: ${user.name} after ${attemptNumber} attempts`);
      // Re-join rooms is handled automatically by socket.io-client, 
      // but we log it for monitoring.
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Disconnected: ${user.name} | Reason: ${reason}`);
      
      // Update Presence: Offline
      presenceService.setOffline(userId);
    });
  });
};
