const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Lütfen adınızı girin'],
    trim: true,
    maxlength: [50, 'Ad 50 karakterden fazla olamaz']
  },
  email: {
    type: String,
    required: [true, 'Lütfen email adresinizi girin'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Lütfen geçerli bir email adresi girin'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Lütfen telefon numaranızı girin'],
    match: [
      /^[0-9]{10,11}$/,
      'Lütfen geçerli bir telefon numarası girin'
    ]
  },
  identityNumber: {
    type: String,
    match: [
      /^[0-9]{11}$/,
      'TC Kimlik No 11 rakamdan oluşmalıdır'
    ]
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
  password: {
    type: String,
    required: [true, 'Lütfen bir şifre girin'],
    minlength: [6, 'Şifre en az 6 karakter olmalıdır'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'provider', 'admin'],
    default: 'user'
  },
  identityVerified: {
    type: Boolean,
    default: false
  },
  vehicles: [{
    make: String,
    model: String,
    year: Number,
    plate: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Şifreyi hashleme
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// JWT Token oluştur
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Şifre eşleşiyor mu kontrol et
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema); 