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
    ref: 'Appointment'
  },
  rating: {
    type: Number,
    required: [true, 'Değerlendirme puanı gereklidir'],
    min: [1, 'Değerlendirme en az 1 olmalıdır'],
    max: [5, 'Değerlendirme en fazla 5 olmalıdır']
  },
  comment: {
    type: String,
    required: [true, 'Yorum gereklidir'],
    trim: true,
    maxlength: [500, 'Yorum 500 karakterden fazla olamaz']
  },
  approved: {
    type: Boolean,
    default: false
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