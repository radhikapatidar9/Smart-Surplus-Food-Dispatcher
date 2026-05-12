const User = require('../models/User');
const AppError = require('../utils/AppError');
const { generateTokenPair, verifyRefreshToken, hashToken } = require('../utils/tokenUtils');

/**
 * Auth service — contains all authentication business logic.
 * Controllers delegate here; this layer throws AppError on failure.
 */

/**
 * Sanitize user object for API responses.
 * @param {Object} user - Mongoose user document
 * @returns {Object} Safe user payload (no password, no refresh tokens)
 */
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  location: user.location,
  status: user.status,
});

/**
 * Register a new user account.
 * @param {{ name, email, password, role, location }} data
 * @returns {{ user, accessToken, refreshToken }}
 */
const signup = async ({ name, email, password, role, location }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    location: location || '',
  });

  const { accessToken, refreshToken } = generateTokenPair(user);

  // Store hashed refresh token on the user document
  user.refreshTokens.push(hashToken(refreshToken));
  await user.save({ validateModifiedOnly: true });

  return { user: sanitizeUser(user), accessToken, refreshToken };
};

/**
 * Authenticate existing user with email + password.
 * @param {{ email, password }} credentials
 * @returns {{ user, accessToken, refreshToken }}
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password +refreshTokens');
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  if (user.status === 'suspended') {
    throw new AppError('Account suspended. Contact administrator.', 403);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  const { accessToken, refreshToken } = generateTokenPair(user);

  // Store hashed refresh token
  user.refreshTokens.push(hashToken(refreshToken));
  await user.save({ validateModifiedOnly: true });

  return { user: sanitizeUser(user), accessToken, refreshToken };
};

/**
 * Issue a new access token using a valid refresh token.
 * Also rotates the refresh token (one-time use) for security.
 * @param {string} token - Current refresh token
 * @returns {{ user, accessToken, refreshToken }}
 */
const refreshAccessToken = async (token) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const hashedToken = hashToken(token);
  const user = await User.findById(decoded.id).select('+refreshTokens');

  if (!user) {
    throw new AppError('User not found', 401);
  }

  // Check if this refresh token exists in the user's stored tokens
  const tokenIndex = user.refreshTokens.indexOf(hashedToken);
  if (tokenIndex === -1) {
    // Possible token reuse attack — revoke ALL refresh tokens
    user.refreshTokens = [];
    await user.save({ validateModifiedOnly: true });
    throw new AppError('Refresh token reuse detected. All sessions revoked.', 401);
  }

  // Rotate: remove old token, issue new pair
  user.refreshTokens.splice(tokenIndex, 1);

  const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user);
  user.refreshTokens.push(hashToken(newRefreshToken));
  await user.save({ validateModifiedOnly: true });

  return { user: sanitizeUser(user), accessToken, refreshToken: newRefreshToken };
};

/**
 * Invalidate a specific refresh token (single-device logout).
 * @param {string} token - Refresh token to revoke
 * @param {string} userId - Authenticated user's ID
 */
const logout = async (token, userId) => {
  if (!token) return; // Graceful no-op if no token provided

  const hashedToken = hashToken(token);
  await User.findByIdAndUpdate(userId, {
    $pull: { refreshTokens: hashedToken },
  });
};

/**
 * Invalidate ALL refresh tokens for a user (all-device logout).
 * @param {string} userId - Authenticated user's ID
 */
const logoutAll = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshTokens: [] });
};

/**
 * Get the current authenticated user's profile.
 * @param {Object} user - User object from request (set by protect middleware)
 * @returns {Object} Sanitized user
 */
const getProfile = (user) => {
  return sanitizeUser(user);
};

module.exports = {
  signup,
  login,
  refreshAccessToken,
  logout,
  logoutAll,
  getProfile,
  sanitizeUser,
};
