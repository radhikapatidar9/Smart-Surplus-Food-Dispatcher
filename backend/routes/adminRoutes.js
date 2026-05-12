const express = require('express');
const router = express.Router();
const { getUsers, getStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

router.get('/users', protect, authorize('admin'), getUsers);
router.get('/stats', protect, authorize('admin'), getStats);

module.exports = router;
