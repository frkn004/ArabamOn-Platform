const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brand: {
    type: String,
    required: [true, 'Lütfen marka bilgisini girin'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Lütfen model bilgisini girin'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Lütfen yıl bilgisini girin']
  },
  plate: {
    type: String,
    required: [true, 'Lütfen plaka bilgisini girin'],
    trim: true,
    unique: true
  },
  color: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Vehicle', VehicleSchema); 