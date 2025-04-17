const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Kupon kodu gereklidir'],
    unique: true,
    trim: true,
    uppercase: true
  },
  discount: {
    type: Number,
    required: [true, 'İndirim miktarı gereklidir'],
    min: [0, 'İndirim miktarı 0 veya daha büyük olmalıdır'],
    max: [100, 'İndirim miktarı 100 veya daha küçük olmalıdır']
  },
  discountType: {
    type: String,
    required: [true, 'İndirim türü gereklidir'],
    enum: ['percentage', 'amount'], // Yüzde veya sabit miktar
    default: 'percentage'
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: [true, 'Geçerlilik süresi gereklidir']
  },
  maxUses: {
    type: Number,
    default: null // null = sınırsız
  },
  usedCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isSingleUse: {
    type: Boolean,
    default: false
  },
  minimumAmount: {
    type: Number,
    default: 0
  },
  appliesTo: {
    categories: [String],
    services: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    }],
    providers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider'
    }]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Kupon aktif mi kontrolü
CouponSchema.methods.isValid = function() {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.validFrom &&
    now <= this.validUntil &&
    (this.maxUses === null || this.usedCount < this.maxUses)
  );
};

// Kullanımı artır
CouponSchema.methods.increaseUsage = async function() {
  this.usedCount += 1;
  // Tek kullanımlık ise aktifliği kaldır
  if (this.isSingleUse) {
    this.isActive = false;
  }
  // Maksimum kullanıma ulaşıldıysa pasif yap
  if (this.maxUses !== null && this.usedCount >= this.maxUses) {
    this.isActive = false;
  }
  await this.save();
  return this;
};

module.exports = mongoose.model('Coupon', CouponSchema); 