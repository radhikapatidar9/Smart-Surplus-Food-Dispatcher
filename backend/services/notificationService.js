const Notification = require('../models/Notification');

/**
 * Notification Service — Centralized alert management.
 */

/**
 * Send a notification to a specific user.
 * @param {string} userId - Recipient
 * @param {Object} data - message, type, priority, link, metadata
 * @param {Object} io - Socket.io instance
 */
const notifyUser = async (userId, data, io) => {
  const { message, type, priority, link, metadata } = data;

  const notification = await Notification.create({
    userId,
    type,
    message,
    priority: priority || 'standard',
    link: link || '',
    metadata: metadata || {}
  });

  // Emit real-time if IO is provided
  if (io) {
    io.to(`user:${userId}`).emit('new_notification', notification);
  }

  return notification;
};

/**
 * Broadcast notification to an entire role.
 */
const notifyRole = async (role, data, io) => {
  const User = require('../models/User');
  const users = await User.find({ role, status: 'active' });

  const promises = users.map(user => notifyUser(user._id, data, io));
  return Promise.all(promises);
};

/**
 * Get unread notification count.
 */
const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ userId, read: false });
};

/**
 * Mark all notifications as read for a user.
 */
const markAllRead = async (userId) => {
  return Notification.updateMany({ userId, read: false }, { read: true });
};

module.exports = {
  notifyUser,
  notifyRole,
  getUnreadCount,
  markAllRead
};
