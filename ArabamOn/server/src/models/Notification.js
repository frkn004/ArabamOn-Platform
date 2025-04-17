const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'appointment_created',
      'appointment_updated',
      'appointment_cancelled',
      'appointment_confirmed',
      'provider_approved',
      'provider_rejected',
      'system'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedModel: {
    type: String,
    enum: ['Appointment', 'ServiceProvider', 'Service', 'User', null],
    default: null
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Bildirim sayısını hesaplamak için virtual
NotificationSchema.virtual('isNew').get(function() {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  return this.createdAt > oneDayAgo;
});

// JSON dönüşümünde virtual'ları dahil et
NotificationSchema.set('toJSON', { virtuals: true });
NotificationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Notification', NotificationSchema); 