const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const ServiceProviderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: [true, 'Lütfen şirket adını girin'],
    trim: true,
    maxlength: [100, 'Şirket adı 100 karakterden fazla olamaz']
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Lütfen şirket açıklamasını girin'],
    maxlength: [1000, 'Açıklama 1000 karakterden fazla olamaz']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Türkiye'
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  contactPhone: {
    type: String,
    required: [true, 'Lütfen iletişim numarasını girin']
  },
  specialties: {
    type: [String],
    default: []
  },
  workingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  timeSlots: {
    type: [{
      day: {
        type: String,
        enum: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
        required: true
      },
      slots: [{
        startTime: {
          type: String,
          required: true
        },
        endTime: {
          type: String,
          required: true
        },
        available: {
          type: Boolean,
          default: true
        }
      }]
    }],
    default: [
      {
        day: 'Pazartesi',
        slots: [
          { startTime: '09:00', endTime: '10:00', available: true },
          { startTime: '10:00', endTime: '11:00', available: true },
          { startTime: '11:00', endTime: '12:00', available: true },
          { startTime: '13:00', endTime: '14:00', available: true },
          { startTime: '14:00', endTime: '15:00', available: true },
          { startTime: '15:00', endTime: '16:00', available: true },
          { startTime: '16:00', endTime: '17:00', available: true }
        ]
      },
      {
        day: 'Salı',
        slots: [
          { startTime: '09:00', endTime: '10:00', available: true },
          { startTime: '10:00', endTime: '11:00', available: true },
          { startTime: '11:00', endTime: '12:00', available: true },
          { startTime: '13:00', endTime: '14:00', available: true },
          { startTime: '14:00', endTime: '15:00', available: true },
          { startTime: '15:00', endTime: '16:00', available: true },
          { startTime: '16:00', endTime: '17:00', available: true }
        ]
      },
      {
        day: 'Çarşamba',
        slots: [
          { startTime: '09:00', endTime: '10:00', available: true },
          { startTime: '10:00', endTime: '11:00', available: true },
          { startTime: '11:00', endTime: '12:00', available: true },
          { startTime: '13:00', endTime: '14:00', available: true },
          { startTime: '14:00', endTime: '15:00', available: true },
          { startTime: '15:00', endTime: '16:00', available: true },
          { startTime: '16:00', endTime: '17:00', available: true }
        ]
      },
      {
        day: 'Perşembe',
        slots: [
          { startTime: '09:00', endTime: '10:00', available: true },
          { startTime: '10:00', endTime: '11:00', available: true },
          { startTime: '11:00', endTime: '12:00', available: true },
          { startTime: '13:00', endTime: '14:00', available: true },
          { startTime: '14:00', endTime: '15:00', available: true },
          { startTime: '15:00', endTime: '16:00', available: true },
          { startTime: '16:00', endTime: '17:00', available: true }
        ]
      },
      {
        day: 'Cuma',
        slots: [
          { startTime: '09:00', endTime: '10:00', available: true },
          { startTime: '10:00', endTime: '11:00', available: true },
          { startTime: '11:00', endTime: '12:00', available: true },
          { startTime: '13:00', endTime: '14:00', available: true },
          { startTime: '14:00', endTime: '15:00', available: true },
          { startTime: '15:00', endTime: '16:00', available: true },
          { startTime: '16:00', endTime: '17:00', available: true }
        ]
      },
      {
        day: 'Cumartesi',
        slots: [
          { startTime: '09:00', endTime: '10:00', available: true },
          { startTime: '10:00', endTime: '11:00', available: true },
          { startTime: '11:00', endTime: '12:00', available: true },
          { startTime: '13:00', endTime: '14:00', available: true },
          { startTime: '14:00', endTime: '15:00', available: true },
          { startTime: '15:00', endTime: '16:00', available: true },
          { startTime: '16:00', endTime: '17:00', available: true }
        ]
      },
      {
        day: 'Pazar',
        slots: [
          { startTime: '09:00', endTime: '10:00', available: false },
          { startTime: '10:00', endTime: '11:00', available: false },
          { startTime: '11:00', endTime: '12:00', available: false },
          { startTime: '13:00', endTime: '14:00', available: false },
          { startTime: '14:00', endTime: '15:00', available: false },
          { startTime: '15:00', endTime: '16:00', available: false },
          { startTime: '16:00', endTime: '17:00', available: false }
        ]
      }
    ]
  },
  googleMapsLink: {
    type: String,
    default: ''
  },
  photos: [String],
  approved: {
    type: Boolean,
    default: false
  },
  averageRating: {
    type: Number,
    min: [1, 'Derecelendirme 1\'den az olamaz'],
    max: [5, 'Derecelendirme 5\'ten fazla olamaz'],
    default: 0
  },
  taxId: {
    type: String,
    required: [true, 'Lütfen vergi numarasını girin']
  },
  bankDetails: {
    accountName: String,
    bankName: String,
    iban: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Lokasyon indeksi oluştur
ServiceProviderSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('ServiceProvider', ServiceProviderSchema); 