const express = require('express');
const router = express.Router();
const { signup, login, refreshToken, logout, logoutAll, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { validate, signupSchema, loginSchema, refreshTokenSchema } = require('../middlewares/validate');

// Public routes
router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/logout-all', protect, logoutAll);

module.exports = router;
