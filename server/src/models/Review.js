const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Kullanıcı ID gereklidir']
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: [true, 'Servis sağlayıcı ID gereklidir']
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Lütfen bir değerlendirme puanı girin'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Lütfen bir yorum metni girin'],
    trim: true,
    maxlength: 500
  },
  approved: {
    type: Boolean,
    default: false
  },
  reply: {
    type: String,
    default: null
  },
  replyDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Bir kullanıcı bir servis sağlayıcı için sadece bir yorum yapabilir
ReviewSchema.index({ user: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema); 