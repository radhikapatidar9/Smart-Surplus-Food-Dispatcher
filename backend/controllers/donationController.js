const donationService = require('../services/donationService');

/**
 * Donation Controller — Thin layer for request extraction and real-time triggers.
 */

// @route   GET /api/donations
exports.getDonations = async (req, res, next) => {
  try {
    const result = await donationService.getAllDonations(req.query);
    res.json({
      success: true,
      data: result.donations,
      total: result.total,
      page: result.page,
      limit: result.limit
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/donations/nearby
exports.getNearby = async (req, res, next) => {
  try {
    const { lng, lat, distance } = req.query;
    const donations = await donationService.getNearbyDonations(
      parseFloat(lng), 
      parseFloat(lat), 
      parseFloat(distance)
    );
    res.json({ success: true, data: donations });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/donations/:id
exports.getDonation = async (req, res, next) => {
  try {
    const donation = await donationService.getDonationById(req.params.id);
    res.json({ success: true, data: donation });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/donations
exports.createDonation = async (req, res, next) => {
  try {
    const donation = await donationService.createDonation(req.body, req.user);

    // Emit real-time event ONLY to NGOs
    const io = req.app.get('io');
    if (io) {
      io.to('role:ngo').emit('new_donation', donation);
      io.to('role:admin').emit('new_donation', donation);
    }

    res.status(201).json({ success: true, data: donation });
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/donations/:id/status
exports.updateDonationStatus = async (req, res, next) => {
  try {
    const donation = await donationService.updateStatus(req.params.id, req.body, req.user);

    // Emit real-time update to the specific donation room and involved users
    const io = req.app.get('io');
    if (io) {
      const room = `donation:${donation._id}`;
      io.to(room).emit('donation_updated', donation);
      
      // Also notify private user rooms for reliability
      io.to(`user:${donation.restaurantId}`).emit('donation_status_update', donation);
      if (donation.ngoId) io.to(`user:${donation.ngoId}`).emit('donation_status_update', donation);
      if (donation.volunteerId) io.to(`user:${donation.volunteerId}`).emit('donation_status_update', donation);
    }

    res.json({ success: true, data: donation });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/donations/:id
exports.deleteDonation = async (req, res, next) => {
  try {
    await donationService.deleteDonation(req.params.id, req.user._id);
    res.json({ success: true, message: 'Donation deleted successfully' });
  } catch (error) {
    next(error);
  }
};
