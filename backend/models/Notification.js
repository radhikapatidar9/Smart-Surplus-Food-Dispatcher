const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    index: true,
  },
  message: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'standard', 'high', 'critical'],
    default: 'standard',
  },
  link: {
    type: String, // e.g. /tracking/:id
  },
  metadata: {
    donationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation' },
  },
  read: {
    type: Boolean,
    default: false,
    index: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
