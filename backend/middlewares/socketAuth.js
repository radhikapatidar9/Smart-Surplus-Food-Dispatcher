const { verifyAccessToken } = require('../utils/tokenUtils');
const User = require('../models/User');

/**
 * Socket.IO Authentication Middleware.
 * Verifies the JWT passed in the 'auth' handshake.
 */
const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('name role status');

    if (!user || user.status === 'suspended') {
      return next(new Error('Authentication error: Invalid user'));
    }

    // Attach user info to socket
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error: Token invalid'));
  }
};

module.exports = socketAuth;
