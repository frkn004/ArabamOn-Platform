const Service = require('../models/Service');
const Business = require('../models/Business');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Tüm hizmetleri getir
 * @route   GET /api/services
 * @route   GET /api/businesses/:businessId/services
 * @access  Public
 */
exports.getServices = async (req, res, next) => {
  try {
    let query;
    
    if (req.params.businessId) {
      // Belirli bir işletmeye ait hizmetleri getir
      const business = await Business.findById(req.params.businessId);
      
      if (!business) {
        return next(new ErrorResponse(`${req.params.businessId} ID'li işletme bulunamadı`, 404));
      }
      
      // Sadece aktif işletmelerin hizmetlerini göster
      if (!business.isActive) {
        return next(new ErrorResponse(`Bu işletme aktif değil`, 404));
      }
      
      query = Service.find({ 
        business: req.params.businessId,
        isActive: true
      });
    } else {
      // Tüm hizmetleri getir, filtreleme işlemleri
      const reqQuery = { ...req.query };
      
      // Özel alanları filtrelemeden çıkar
      const removeFields = ['select', 'sort', 'page', 'limit'];
      removeFields.forEach(param => delete reqQuery[param]);
      
      // MongoDB filtreleme operatörlerini ekle
      let queryStr = JSON.stringify(reqQuery);
      queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
      
      // Sadece aktif hizmetleri getir
      query = Service.find({ ...JSON.parse(queryStr), isActive: true });
    }
    
    // Belirli alanları seçme
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    
    // İlişkili işletme bilgilerini getir
    query = query.populate({
      path: 'business',
      select: 'name type address.city',
      match: { isActive: true }
    });
    
    // Sıralama
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('price');
    }
    
    // Sayfalama
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Service.countDocuments({ 
      ...JSON.parse(queryStr), 
      isActive: true,
      ...(req.params.businessId && { business: req.params.businessId })
    });
    
    query = query.skip(startIndex).limit(limit);
    
    // Sorguyu çalıştır
    const services = await query;
    
    // İşletmesi aktif olmayan hizmetleri filtrele
    const filteredServices = services.filter(service => service.business !== null);
    
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
      count: filteredServices.length,
      pagination,
      data: filteredServices
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Belirli bir hizmeti getir
 * @route   GET /api/services/:id
 * @access  Public
 */
exports.getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate({
      path: 'business',
      select: 'name type address workingHours',
      match: { isActive: true }
    });
    
    if (!service) {
      return next(new ErrorResponse(`${req.params.id} ID'li hizmet bulunamadı`, 404));
    }
    
    if (!service.isActive) {
      return next(new ErrorResponse(`Bu hizmet artık aktif değil`, 404));
    }
    
    if (!service.business) {
      return next(new ErrorResponse(`Bu hizmetin bağlı olduğu işletme aktif değil`, 404));
    }
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Yeni hizmet oluştur
 * @route   POST /api/businesses/:businessId/services
 * @access  Private (İşletme sahibi, Admin)
 */
exports.createService = async (req, res, next) => {
  try {
    // Form verilerine işletme ID'sini ekle
    req.body.business = req.params.businessId;
    
    // İşletmeyi kontrol et
    const business = await Business.findById(req.params.businessId);
    
    if (!business) {
      return next(new ErrorResponse(`${req.params.businessId} ID'li işletme bulunamadı`, 404));
    }
    
    // İşletme sahibi veya admin erişim kontrolü
    if (business.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Bu işletmeye hizmet ekleme yetkiniz yok`, 403));
    }
    
    // Hizmetin işletme türünü otomatik belirle
    req.body.businessType = business.type;
    
    const service = await Service.create(req.body);
    
    res.status(201).json({
      success: true,
      data: service
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Hizmet güncelle
 * @route   PUT /api/services/:id
 * @access  Private (İşletme sahibi, Admin)
 */
exports.updateService = async (req, res, next) => {
  try {
    let service = await Service.findById(req.params.id);
    
    if (!service) {
      return next(new ErrorResponse(`${req.params.id} ID'li hizmet bulunamadı`, 404));
    }
    
    // İşletmeyi bul
    const business = await Business.findById(service.business);
    
    if (!business) {
      return next(new ErrorResponse(`Bu hizmetin bağlı olduğu işletme bulunamadı`, 404));
    }
    
    // İşletme sahibi veya admin erişim kontrolü
    if (business.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Bu hizmeti güncelleme yetkiniz yok`, 403));
    }
    
    // İşletme veya businessType değiştirilmesini engelle
    if (req.body.business && req.body.business !== service.business.toString()) {
      return next(new ErrorResponse(`Hizmetin bağlı olduğu işletmeyi değiştiremezsiniz`, 400));
    }
    
    if (req.body.businessType && req.body.businessType !== service.businessType) {
      return next(new ErrorResponse(`Hizmetin iş türünü değiştiremezsiniz`, 400));
    }
    
    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Hizmet sil (veya pasif hale getir)
 * @route   DELETE /api/services/:id
 * @access  Private (İşletme sahibi, Admin)
 */
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return next(new ErrorResponse(`${req.params.id} ID'li hizmet bulunamadı`, 404));
    }
    
    // İşletmeyi bul
    const business = await Business.findById(service.business);
    
    if (!business) {
      return next(new ErrorResponse(`Bu hizmetin bağlı olduğu işletme bulunamadı`, 404));
    }
    
    // İşletme sahibi veya admin erişim kontrolü
    if (business.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Bu hizmeti silme yetkiniz yok`, 403));
    }
    
    // Gerçekten silmek yerine pasif hale getir
    service.isActive = false;
    await service.save();
    
    res.status(200).json({
      success: true,
      data: {},
      message: 'Hizmet pasif hale getirildi'
    });
  } catch (err) {
    next(err);
  }
}; 