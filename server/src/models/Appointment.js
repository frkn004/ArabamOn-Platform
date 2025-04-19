const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Lütfen bir randevu tarihi seçin']
  },
  status: {
    type: String,
    enum: ['beklemede', 'onaylandı', 'tamamlandı', 'iptal edildi'],
    default: 'beklemede'
  },
  totalPrice: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    maxlength: [500, 'Notlar 500 karakterden fazla olamaz']
  },
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Appointment', AppointmentSchema); 