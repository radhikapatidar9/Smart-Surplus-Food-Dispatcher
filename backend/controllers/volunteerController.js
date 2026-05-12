const volunteerService = require('../services/volunteerService');

/**
 * Volunteer Controller — Session and Telemetry management.
 */

// @route   POST /api/volunteers/session/start
exports.startSession = async (req, res, next) => {
  try {
    const session = await volunteerService.startSession(req.user._id, {
      lng: req.body.lng,
      lat: req.body.lat,
      deviceInfo: {
        os: req.headers['sec-ch-ua-platform'],
        browser: req.headers['user-agent']
      }
    });
    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/volunteers/session/telemetry
exports.updateTelemetry = async (req, res, next) => {
  try {
    const { lng, lat } = req.body;
    const session = await volunteerService.updateTelemetry(req.user._id, lng, lat);
    
    // Emit location to socket rooms
    const io = req.app.get('io');
    if (io) {
      io.emit('volunteer_location', {
        userId: req.user._id,
        location: session.location,
        timestamp: new Date()
      });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/volunteers/session/availability
exports.toggleAvailability = async (req, res, next) => {
  try {
    const { isAvailable } = req.body;
    const session = await volunteerService.toggleAvailability(req.user._id, isAvailable);
    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/volunteers/session/stop
exports.stopSession = async (req, res, next) => {
  try {
    await volunteerService.endSession(req.user._id);
    res.json({ success: true, message: 'Session ended' });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/volunteers/nearby
// @access  NGO / Admin
exports.getNearby = async (req, res, next) => {
  try {
    const { lng, lat, radius } = req.query;
    const volunteers = await volunteerService.getNearbyVolunteers(
      parseFloat(lng),
      parseFloat(lat),
      parseFloat(radius) || 5000
    );
    res.json({ success: true, data: volunteers });
  } catch (error) {
    next(error);
  }
};
