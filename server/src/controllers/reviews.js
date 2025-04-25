const Review = require('../models/Review');
const ServiceProvider = require('../models/ServiceProvider');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const User = require('../models/User');

// @desc    Tüm yorumları getir (admin için)
// @route   GET /api/reviews
// @access  Private/Admin
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate({
        path: 'provider',
        select: 'companyName'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Onaylanmış yorumları getir
// @route   GET /api/reviews/approved
// @access  Public
exports.getApprovedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ approved: true })
      .populate({
        path: 'user',
        select: 'name'
      })
      .populate({
        path: 'provider',
        select: 'companyName'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Kullanıcının yorumlarını getir
// @route   GET /api/reviews/user
// @access  Private
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate({
        path: 'provider',
        select: 'companyName'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Servis sağlayıcının yorumlarını getir
// @route   GET /api/reviews/provider/:providerId
// @access  Public
exports.getProviderReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      provider: req.params.providerId,
      approved: true
    })
      .populate({
        path: 'user',
        select: 'name'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Giriş yapmış servis sağlayıcının yorumlarını getir
// @route   GET /api/reviews/provider
// @access  Private (Provider)
exports.getMyProviderReviews = async (req, res) => {
  try {
    // Önce servis sağlayıcıyı bul
    const provider = await ServiceProvider.findOne({ user: req.user.id });
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Servis sağlayıcı bulunamadı'
      });
    }
    
    // Servis sağlayıcının yorumlarını getir (en yeniden en eskiye)
    const reviews = await Review.find({ provider: provider._id })
      .populate({
        path: 'user',
        select: 'name'
      })
      .populate({
        path: 'service',
        select: 'name'
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

// @desc    Yorum oluştur
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    // Kullanıcının bu servis sağlayıcı ile tamamlanmış bir randevusu var mı kontrol et
    const appointment = await Appointment.findOne({
      user: req.user.id,
      provider: req.body.provider,
      status: 'tamamlandı'
    });

    if (!appointment) {
      return res.status(400).json({
        success: false,
        message: 'Tamamlanmış bir randevunuz olmadan yorum yapamazsınız'
      });
    }

    // Kullanıcının bu servis sağlayıcı için zaten bir yorumu var mı kontrol et
    const existingReview = await Review.findOne({
      user: req.user.id,
      provider: req.body.provider
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Bu servis sağlayıcı için zaten bir yorumunuz var'
      });
    }

    // Yorumu oluştur
    req.body.user = req.user.id;
    req.body.approved = false; // Varsayılan olarak onaysız

    const review = await Review.create(req.body);

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Yorumu onayla
// @route   PUT /api/reviews/:id/approve
// @access  Private/Admin
exports.approveReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true, runValidators: true }
    ).populate({
      path: 'provider',
      select: 'companyName rating reviewCount'
    }).populate({
      path: 'user',
      select: 'name'
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Yorum bulunamadı'
      });
    }

    // Servis sağlayıcının ortalama puanını güncelle
    await updateProviderRating(review.provider._id);

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Reply to a review
// @route   POST /api/reviews/:id/reply
// @access  Private (Provider)
exports.replyToReview = async (req, res) => {
  try {
    const { reply } = req.body;
    
    if (!reply || reply.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Yanıt metni gereklidir'
      });
    }
    
    // Yorumu bul
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Yorum bulunamadı'
      });
    }
    
    // Servis sağlayıcıyı bul
    const provider = await ServiceProvider.findOne({ user: req.user.id });
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Servis sağlayıcı bulunamadı'
      });
    }
    
    // Yorumun bu servis sağlayıcıya ait olduğundan emin ol
    if (review.provider.toString() !== provider._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu yoruma yanıt verme yetkiniz yok'
      });
    }
    
    // Yanıtı ekle
    review.reply = reply;
    review.replyDate = Date.now();
    
    await review.save();
    
    res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

// Yardımcı fonksiyon: Servis sağlayıcının ortalama puanını günceller
const updateProviderRating = async (providerId) => {
  const provider = await ServiceProvider.findById(providerId);
  
  if (!provider) {
    throw new Error('Servis sağlayıcı bulunamadı');
  }
  
  // Onaylanmış yorumları bul ve ortalama puanı hesapla
  const reviews = await Review.find({ 
    provider: providerId,
    approved: true 
  });
  
  if (reviews.length === 0) {
    provider.rating = 0;
    provider.reviewCount = 0;
  } else {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    provider.rating = (totalRating / reviews.length).toFixed(1);
    provider.reviewCount = reviews.length;
  }
  
  await provider.save();
}; 