const User = require('../models/User');
const AppError = require('../utils/AppError');
const { verifyAccessToken } = require('../utils/tokenUtils');

/**
 * Protect middleware — verifies JWT access token from Authorization header.
 * Attaches the authenticated user to req.user.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Not authorized, no token provided', 401);
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-password -refreshTokens');

    if (!user) {
      throw new AppError('User belonging to this token no longer exists', 401);
    }

    if (user.status === 'suspended') {
      throw new AppError('Account suspended. Contact administrator.', 403);
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      throw new AppError('User recently changed password! Please log in again.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error.isOperational ? error : new AppError('Not authorized, token invalid', 401));
  }
};

/**
 * Authorize middleware — restricts access to specific roles.
 * Must be used AFTER protect middleware.
 *
 * @param  {...string} roles - Allowed roles (e.g. 'admin', 'restaurant')
 * @returns {Function} Express middleware
 *
 * @example
 *   router.get('/admin', protect, authorize('admin'), handler);
 *   router.post('/donate', protect, authorize('restaurant', 'ngo'), handler);
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`Role '${req.user.role}' is not authorized to access this resource`, 403)
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
