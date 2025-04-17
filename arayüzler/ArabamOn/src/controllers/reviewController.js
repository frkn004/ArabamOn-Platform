const Review = require('../models/Review');
const Business = require('../models/Business');
const Appointment = require('../models/Appointment');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Tüm değerlendirmeleri getir
 * @route   GET /api/reviews
 * @route   GET /api/businesses/:businessId/reviews
 * @access  Public
 */
exports.getReviews = async (req, res, next) => {
  try {
    let query;
    
    if (req.params.businessId) {
      // Belirli bir işletmeye ait değerlendirmeleri getir
      const business = await Business.findById(req.params.businessId);
      
      if (!business) {
        return next(new ErrorResponse(`${req.params.businessId} ID'li işletme bulunamadı`, 404));
      }
      
      // Sadece onaylanmış değerlendirmeleri göster
      query = Review.find({ 
        business: req.params.businessId,
        isApproved: true
      });
    } else {
      // Admin için tüm değerlendirmeleri getir
      if (req.user && req.user.role === 'admin') {
        query = Review.find();
      } else {
        // Sadece onaylanmış değerlendirmeleri getir
        query = Review.find({ isApproved: true });
      }
    }
    
    // İlişkili veriyi getir
    query = query.populate([
      {
        path: 'user',
        select: 'name'
      },
      {
        path: 'business',
        select: 'name type'
      }
    ]);
    
    // Sıralama
    query = query.sort('-createdAt');
    
    // Sayfalama
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Review.countDocuments(query);
    
    query = query.skip(startIndex).limit(limit);
    
    // Sorguyu çalıştır
    const reviews = await query;
    
    // Sayfalama sonuçları
    const pagination = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      pagination,
      data: reviews
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Tek bir değerlendirme getir
 * @route   GET /api/reviews/:id
 * @access  Public
 */
exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name'
      })
      .populate({
        path: 'business',
        select: 'name type address'
      });
    
    if (!review) {
      return next(new ErrorResponse(`${req.params.id} ID'li değerlendirme bulunamadı`, 404));
    }
    
    // Sadece onaylanmış değerlendirmeleri göster (admin hariç)
    if (!review.isApproved && (!req.user || req.user.role !== 'admin')) {
      return next(new ErrorResponse(`${req.params.id} ID'li değerlendirme bulunamadı`, 404));
    }
    
    res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Yeni değerlendirme oluştur
 * @route   POST /api/businesses/:businessId/reviews
 * @access  Private (User)
 */
exports.createReview = async (req, res, next) => {
  try {
    // Form verilerine kullanıcı ve işletme ID'sini ekle
    req.body.user = req.user.id;
    req.body.business = req.params.businessId;
    
    // İşletmeyi kontrol et
    const business = await Business.findById(req.params.businessId);
    
    if (!business) {
      return next(new ErrorResponse(`${req.params.businessId} ID'li işletme bulunamadı`, 404));
    }
    
    if (!business.isActive) {
      return next(new ErrorResponse(`Bu işletme için değerlendirme yapılamaz`, 400));
    }
    
    // Kullanıcının bu işletmeyi daha önce değerlendirip değerlendirmediğini kontrol et
    const existingReview = await Review.findOne({
      user: req.user.id,
      business: req.params.businessId
    });
    
    if (existingReview) {
      return next(new ErrorResponse(`Bu işletme için zaten bir değerlendirmeniz var`, 400));
    }
    
    // Değerlendirme yapmak için tamamlanmış bir randevu olup olmadığını kontrol et
    const completedAppointment = await Appointment.findOne({
      user: req.user.id,
      business: req.params.businessId,
      status: 'tamamlandı'
    });
    
    if (!completedAppointment) {
      return next(new ErrorResponse(`Bu işletme için tamamlanmış bir randevunuz olmadan değerlendirme yapamazsınız`, 400));
    }
    
    // Randevuyu değerlendirmeye ekle
    req.body.appointment = completedAppointment._id;
    
    // Değerlendirme oluştur
    const review = await Review.create(req.body);
    
    res.status(201).json({
      success: true,
      data: review
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Değerlendirme güncelle
 * @route   PUT /api/reviews/:id
 * @access  Private (Değerlendirmeyi yapan kullanıcı)
 */
exports.updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);
    
    if (!review) {
      return next(new ErrorResponse(`${req.params.id} ID'li değerlendirme bulunamadı`, 404));
    }
    
    // Değerlendirmeyi yapan kullanıcının kendisi olduğunu kontrol et
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Bu değerlendirmeyi güncelleme yetkiniz yok`, 403));
    }
    
    // Admin değilse sadece belirli alanları güncelleyebilir
    if (req.user.role !== 'admin') {
      const allowedUpdates = ['rating', 'comment'];
      const requestedUpdates = Object.keys(req.body);
      
      for (const key of requestedUpdates) {
        if (!allowedUpdates.includes(key)) {
          return next(new ErrorResponse(`${key} alanını değiştirme yetkiniz yok`, 400));
        }
      }
    }
    
    // Değerlendirmeyi güncelle
    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Değerlendirme sil
 * @route   DELETE /api/reviews/:id
 * @access  Private (Değerlendirmeyi yapan kullanıcı, Admin)
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return next(new ErrorResponse(`${req.params.id} ID'li değerlendirme bulunamadı`, 404));
    }
    
    // Değerlendirmeyi yapan kullanıcının kendisi olduğunu kontrol et
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Bu değerlendirmeyi silme yetkiniz yok`, 403));
    }
    
    await review.remove();
    
    res.status(200).json({
      success: true,
      data: {},
      message: 'Değerlendirme silindi'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Değerlendirmeyi onayla veya reddet
 * @route   PUT /api/reviews/:id/approve
 * @access  Private (Admin)
 */
exports.approveReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return next(new ErrorResponse(`${req.params.id} ID'li değerlendirme bulunamadı`, 404));
    }
    
    review.isApproved = req.body.isApproved;
    await review.save();
    
    res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    next(err);
  }
}; 