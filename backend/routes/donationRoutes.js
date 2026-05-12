const express = require('express');
const router = express.Router();
const { 
  getDonations, 
  getDonation, 
  getNearby,
  createDonation, 
  updateDonationStatus, 
  deleteDonation 
} = require('../controllers/donationController');
const { protect, authorize } = require('../middlewares/auth');
const { validate, createDonationSchema, updateDonationStatusSchema } = require('../middlewares/validate');

// Public/General Protected Routes
router.get('/', protect, getDonations);
router.get('/nearby', protect, getNearby);
router.get('/:id', protect, getDonation);

// Restaurant Only
router.post('/', protect, authorize('restaurant', 'admin'), validate(createDonationSchema), createDonation);
router.delete('/:id', protect, authorize('restaurant', 'admin'), deleteDonation);

// Logistics/Status Updates (NGOs and Volunteers)
router.patch('/:id/status', protect, authorize('ngo', 'volunteer', 'admin'), validate(updateDonationStatusSchema), updateDonationStatus);

module.exports = router;
