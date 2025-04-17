const Coupon = require('../models/Coupon');
const Service = require('../models/Service');

// @desc    Kupon kodu oluştur
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    
    // Kupon kodu eklerken büyük harfe dönüştür
    if (req.body.code) {
      req.body.code = req.body.code.toUpperCase();
    }
    
    const coupon = await Coupon.create(req.body);
    
    res.status(201).json({
      success: true,
      data: coupon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Tüm kuponları getir
// @route   GET /api/coupons
// @access  Private/Admin
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Tek kupon getir
// @route   GET /api/coupons/:id
// @access  Private/Admin
exports.getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Kupon bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: coupon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Kupon güncelle
// @route   PUT /api/coupons/:id
// @access  Private/Admin
exports.updateCoupon = async (req, res) => {
  try {
    // Kupon kodu eklerken büyük harfe dönüştür
    if (req.body.code) {
      req.body.code = req.body.code.toUpperCase();
    }
    
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Kupon bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: coupon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Kupon sil
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Kupon bulunamadı'
      });
    }
    
    await coupon.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Kupon başarıyla silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Kupon kodunu doğrula
// @route   POST /api/coupons/validate
// @access  Private
exports.validateCoupon = async (req, res) => {
  try {
    const { code, serviceId, amount } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Kupon kodu gereklidir'
      });
    }
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Geçersiz kupon kodu'
      });
    }
    
    // Kupon geçerli mi kontrolü
    if (!coupon.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Bu kupon artık geçerli değil'
      });
    }
    
    // Minimum tutar kontrolü
    if (amount && amount < coupon.minimumAmount) {
      return res.status(400).json({
        success: false,
        message: `Bu kupon minimum ${coupon.minimumAmount} TL ve üzeri alışverişlerde geçerlidir`
      });
    }
    
    // Hizmet uyumluluk kontrolü
    if (serviceId && coupon.appliesTo.services.length > 0) {
      const isApplicable = coupon.appliesTo.services.includes(serviceId);
      
      if (!isApplicable) {
        return res.status(400).json({
          success: false,
          message: 'Bu kupon seçilen hizmet için geçerli değil'
        });
      }
    }
    
    // Kategori uyumluluk kontrolü
    if (serviceId && coupon.appliesTo.categories.length > 0) {
      const service = await Service.findById(serviceId);
      
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Hizmet bulunamadı'
        });
      }
      
      const isApplicable = coupon.appliesTo.categories.includes(service.category);
      
      if (!isApplicable) {
        return res.status(400).json({
          success: false,
          message: 'Bu kupon seçilen hizmet kategorisi için geçerli değil'
        });
      }
    }
    
    // İndirim hesaplama
    let discountAmount = 0;
    
    if (amount) {
      if (coupon.discountType === 'percentage') {
        discountAmount = (amount * coupon.discount) / 100;
      } else {
        discountAmount = coupon.discount;
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        coupon,
        discountAmount,
        discountType: coupon.discountType
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Kupon kullan
// @route   POST /api/coupons/redeem
// @access  Private
exports.redeemCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Kupon kodu gereklidir'
      });
    }
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Geçersiz kupon kodu'
      });
    }
    
    // Kupon geçerli mi kontrolü
    if (!coupon.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Bu kupon artık geçerli değil'
      });
    }
    
    // Kupon kullanımını artır
    await coupon.increaseUsage();
    
    res.status(200).json({
      success: true,
      message: 'Kupon başarıyla kullanıldı',
      data: coupon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
}; 