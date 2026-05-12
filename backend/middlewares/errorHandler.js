const AppError = require('../utils/AppError');

/**
 * Centralized error handling middleware.
 * All errors thrown or passed via next(err) converge here.
 *
 * - AppError instances → structured JSON with correct status code
 * - Mongoose validation errors → 400 with field-level messages
 * - Mongoose duplicate key → 409 conflict
 * - JWT errors → 401 unauthorized
 * - Unknown errors → 500 with generic message (details hidden in production)
 */
const errorHandler = (err, req, res, next) => {
  let error = {
    message: err.message || 'Internal Server Error',
    statusCode: err.statusCode || 500,
  };

  // ── Mongoose: Validation Error ──────────────────────────────────────────
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error.message = messages.join('. ');
    error.statusCode = 400;
  }

  // ── Mongoose: Duplicate Key ─────────────────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `${field} already exists`;
    error.statusCode = 409;
  }

  // ── Mongoose: Cast Error (invalid ObjectId, etc.) ───────────────────────
  if (err.name === 'CastError') {
    error.message = `Invalid ${err.path}: ${err.value}`;
    error.statusCode = 400;
  }

  // ── JWT: Invalid Token ──────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.statusCode = 401;
  }

  // ── JWT: Expired Token ──────────────────────────────────────────────────
  if (err.name === 'TokenExpiredError') {
    error.message = 'Token has expired';
    error.statusCode = 401;
  }

  // Log in development, suppress details in production
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  } else {
    if (!err.isOperational) {
      console.error('❌ UNEXPECTED ERROR:', err);
    }
  }

  res.status(error.statusCode).json({
    success: false,
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
