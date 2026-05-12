const express = require('express');
const router = express.Router();
const { 
  startSession, 
  updateTelemetry, 
  toggleAvailability, 
  stopSession, 
  getNearby 
} = require('../controllers/volunteerController');
const { protect, authorize } = require('../middlewares/auth');

// Volunteer Only Routes
router.post('/session/start', protect, authorize('volunteer'), startSession);
router.patch('/session/telemetry', protect, authorize('volunteer'), updateTelemetry);
router.patch('/session/availability', protect, authorize('volunteer'), toggleAvailability);
router.post('/session/stop', protect, authorize('volunteer'), stopSession);

// Logistics/Management Routes (NGOs and Admins)
router.get('/nearby', protect, authorize('ngo', 'admin'), getNearby);

module.exports = router;
