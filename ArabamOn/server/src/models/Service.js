const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Lütfen hizmet adını girin'],
    trim: true,
    maxlength: [100, 'Hizmet adı 100 karakterden fazla olamaz']
  },
  description: {
    type: String,
    required: [true, 'Lütfen hizmet açıklamasını girin'],
    maxlength: [1000, 'Açıklama 1000 karakterden fazla olamaz']
  },
  category: {
    type: String,
    required: [true, 'Lütfen hizmet kategorisini seçin'],
    enum: [
      'Araç Yıkama',
      'Teknik Muayene',
      'Lastik Değişimi',
      'Otopark',
      'Bakım',
      'Onarım',
      'Diğer'
    ]
  },
  price: {
    type: Number,
    required: [true, 'Lütfen hizmet fiyatını girin']
  },
  duration: {
    type: Number,
    required: [true, 'Lütfen hizmet süresini dakika olarak girin'],
    default: 60
  },
  image: {
    type: String,
    default: 'no-photo.jpg'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Service', ServiceSchema); 