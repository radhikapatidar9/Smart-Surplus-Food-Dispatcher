const express = require('express');
const router = express.Router();
const { uploadImage } = require('../controllers/uploadController');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// POST /api/upload - Secure single image upload
router.post('/', protect, upload.single('image'), uploadImage);

module.exports = router;
