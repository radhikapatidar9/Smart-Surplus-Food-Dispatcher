const AppError = require('../utils/AppError');

/**
 * Validation middleware factory.
 * Takes a schema definition object and returns Express middleware
 * that validates req.body against it before reaching the controller.
 *
 * Schema format:
 *   { fieldName: { required, type, minLength, maxLength, enum, match, message } }
 */
const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      // Required check
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(rules.message || `${field} is required`);
        continue;
      }

      // Skip further checks if field is optional and not provided
      if (value === undefined || value === null || value === '') continue;

      // Type check
      if (rules.type && typeof value !== rules.type) {
        errors.push(`${field} must be of type ${rules.type}`);
        continue;
      }

      // String-specific validations
      if (typeof value === 'string') {
        if (rules.minLength && value.trim().length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        }
        if (rules.maxLength && value.trim().length > rules.maxLength) {
          errors.push(`${field} must be at most ${rules.maxLength} characters`);
        }
        if (rules.match && !rules.match.test(value)) {
          errors.push(rules.matchMessage || `${field} format is invalid`);
        }
        if (rules.enum && !rules.enum.includes(value)) {
          errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
        }
      }
    }

    if (errors.length > 0) {
      throw new AppError(errors.join('. '), 400);
    }

    next();
  };
};

// ─── Reusable Validation Schemas ─────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = ['restaurant', 'ngo', 'volunteer', 'admin'];

const signupSchema = {
  name: {
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 50,
    message: 'Name is required',
  },
  email: {
    required: true,
    type: 'string',
    match: EMAIL_REGEX,
    matchMessage: 'Please provide a valid email address',
    message: 'Email is required',
  },
  password: {
    required: true,
    type: 'string',
    minLength: 6,
    maxLength: 128,
    message: 'Password is required (min 6 characters)',
  },
  role: {
    required: true,
    type: 'string',
    enum: VALID_ROLES,
    message: 'Role is required',
  },
};

const loginSchema = {
  email: {
    required: true,
    type: 'string',
    match: EMAIL_REGEX,
    matchMessage: 'Please provide a valid email address',
    message: 'Email is required',
  },
  password: {
    required: true,
    type: 'string',
    message: 'Password is required',
  },
};

const refreshTokenSchema = {
  refreshToken: {
    required: true,
    type: 'string',
    message: 'Refresh token is required',
  },
};

const createDonationSchema = {
  foodType: {
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 100,
    message: 'Food type is required',
  },
  quantity: {
    required: true,
    type: 'string',
    message: 'Quantity is required',
  },
  unit: {
    type: 'string',
    enum: ['kg', 'lbs', 'servings', 'packets', 'boxes', 'trays', 'liters', 'units'],
    message: 'Invalid unit',
  },
  category: {
    type: 'string',
    enum: ['critical', 'standard'],
    message: 'Invalid category',
  },
  location: {
    required: true,
    type: 'string',
    message: 'Location address is required',
  },
  lat: {
    type: 'number',
    message: 'Latitude must be a number',
  },
  lng: {
    type: 'number',
    message: 'Longitude must be a number',
  },
};

const updateDonationStatusSchema = {
  status: {
    required: true,
    type: 'string',
    enum: [
      'pending', 
      'accepted',
      'volunteer_assigned', 
      'pickup_started', 
      'picked_up', 
      'in_transit', 
      'delivered', 
      'completed', 
      'rejected', 
      'expired', 
      'cancelled'
    ],
    message: 'Invalid status',
  },
  ngoId: {
    type: 'string',
    message: 'NGO ID must be a string',
  },
  volunteerId: {
    type: 'string',
    message: 'Volunteer ID must be a string',
  },
};

module.exports = {
  validate,
  signupSchema,
  loginSchema,
  refreshTokenSchema,
  createDonationSchema,
  updateDonationStatusSchema,
};
