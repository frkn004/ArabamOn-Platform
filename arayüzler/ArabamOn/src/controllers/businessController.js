const Business = require('../models/Business');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Tüm işletmeleri getir
 * @route   GET /api/businesses
 * @access  Public
 */
exports.getBusinesses = async (req, res, next) => {
  try {
    // Filtreleme işlemleri
    let query;
    const reqQuery = { ...req.query };
    
    // Özel alanları filtrelemeden çıkar
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);
    
    // MongoDB filtreleme operatörlerini ekle
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Aktif işletmeleri getir
    query = Business.find({ ...JSON.parse(queryStr), isActive: true });
    
    // Belirli alanları seçme
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    
    // Sıralama
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // Sayfalama
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Business.countDocuments({ ...JSON.parse(queryStr), isActive: true });
    
    query = query.skip(startIndex).limit(limit);
    
    // Sorguyu çalıştır
    const businesses = await query;
    
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
      count: businesses.length,
      pagination,
      data: businesses
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Tek bir işletme getir
 * @route   GET /api/businesses/:id
 * @access  Public
 */
exports.getBusiness = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id)
      .populate('services')
      .populate({
        path: 'reviews',
        select: 'rating comment user',
        match: { isApproved: true }
      });
    
    if (!business) {
      return next(new ErrorResponse(`${req.params.id} ID'li işletme bulunamadı`, 404));
    }
    
    if (!business.isActive) {
      return next(new ErrorResponse(`Bu işletme artık aktif değil`, 404));
    }
    
    res.status(200).json({
      success: true,
      data: business
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Yeni işletme oluştur
 * @route   POST /api/businesses
 * @access  Private (Business, Admin)
 */
exports.createBusiness = async (req, res, next) => {
  try {
    // İşletme sahibini oturum açan kullanıcı olarak ayarla
    req.body.owner = req.user.id;
    
    // Varsayılan çalışma saatlerini ekle
    if (!req.body.workingHours || req.body.workingHours.length === 0) {
      const days = ['pazartesi', 'salı', 'çarşamba', 'perşembe', 'cuma', 'cumartesi', 'pazar'];
      req.body.workingHours = days.map(day => ({
        day,
        isOpen: day !== 'pazar',
        openTime: '09:00',
        closeTime: '18:00'
      }));
    }
    
    // Eğer kullanıcı admin değilse, bir kullanıcı sadece bir işletme oluşturabilir
    if (req.user.role !== 'admin') {
      const existingBusiness = await Business.findOne({ owner: req.user.id });
      
      if (existingBusiness) {
        return next(new ErrorResponse('Bir kullanıcı sadece bir işletme ekleyebilir', 400));
      }
    }
    
    const business = await Business.create(req.body);
    
    res.status(201).json({
      success: true,
      data: business
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    İşletme güncelle
 * @route   PUT /api/businesses/:id
 * @access  Private (İşletme sahibi, Admin)
 */
exports.updateBusiness = async (req, res, next) => {
  try {
    let business = await Business.findById(req.params.id);
    
    if (!business) {
      return next(new ErrorResponse(`${req.params.id} ID'li işletme bulunamadı`, 404));
    }
    
    // İşletme sahibinin veya admin'in güncelleme yapabilmesi
    if (business.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Bu işletmeyi güncelleme yetkiniz yok', 403));
    }
    
    // owner alanının değiştirilmesini engelle
    if (req.body.owner && req.body.owner !== business.owner.toString() && req.user.role !== 'admin') {
      return next(new ErrorResponse('İşletme sahibini değiştiremezsiniz', 403));
    }
    
    business = await Business.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: business
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    İşletme sil (veya pasif hale getir)
 * @route   DELETE /api/businesses/:id
 * @access  Private (İşletme sahibi, Admin)
 */
exports.deleteBusiness = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id);
    
    if (!business) {
      return next(new ErrorResponse(`${req.params.id} ID'li işletme bulunamadı`, 404));
    }
    
    // İşletme sahibinin veya admin'in silme yapabilmesi
    if (business.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Bu işletmeyi silme yetkiniz yok', 403));
    }
    
    // Gerçekten silmek yerine pasif hale getir
    business.isActive = false;
    await business.save();
    
    res.status(200).json({
      success: true,
      data: {},
      message: 'İşletme pasif hale getirildi'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Belirli bir konuma yakın işletmeleri getir
 * @route   GET /api/businesses/radius/:zipcode/:distance
 * @access  Public
 */
exports.getBusinessesInRadius = async (req, res, next) => {
  try {
    const { latitude, longitude, distance } = req.params;
    
    // Dünya yarıçapı: 6378 km
    const radius = distance / 6378;
    
    const businesses = await Business.find({
      'address.location': {
        $geoWithin: { $centerSphere: [[longitude, latitude], radius] }
      },
      isActive: true
    });
    
    res.status(200).json({
      success: true,
      count: businesses.length,
      data: businesses
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    İşletmeyi aktif hale getir (onaylama)
 * @route   PUT /api/businesses/:id/activate
 * @access  Private (Admin)
 */
exports.activateBusiness = async (req, res, next) => {
  try {
    let business = await Business.findById(req.params.id);
    
    if (!business) {
      return next(new ErrorResponse(`${req.params.id} ID'li işletme bulunamadı`, 404));
    }
    
    business.isActive = true;
    await business.save();
    
    res.status(200).json({
      success: true,
      data: business
    });
  } catch (err) {
    next(err);
  }
}; 
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Tüm işletmeleri getir
 * @route   GET /api/businesses
 * @access  Public
 */
exports.getBusinesses = async (req, res, next) => {
  try {
    // Filtreleme işlemleri
    let query;
    const reqQuery = { ...req.query };
    
    // Özel alanları filtrelemeden çıkar
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);
    
    // MongoDB filtreleme operatörlerini ekle
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Aktif işletmeleri getir
    query = Business.find({ ...JSON.parse(queryStr), isActive: true });
    
    // Belirli alanları seçme
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    
    // Sıralama
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // Sayfalama
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Business.countDocuments({ ...JSON.parse(queryStr), isActive: true });
    
    query = query.skip(startIndex).limit(limit);
    
    // Sorguyu çalıştır
    const businesses = await query;
    
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
      count: businesses.length,
      pagination,
      data: businesses
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Tek bir işletme getir
 * @route   GET /api/businesses/:id
 * @access  Public
 */
exports.getBusiness = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id)
      .populate('services')
      .populate({
        path: 'reviews',
        select: 'rating comment user',
        match: { isApproved: true }
      });
    
    if (!business) {
      return next(new ErrorResponse(`${req.params.id} ID'li işletme bulunamadı`, 404));
    }
    
    if (!business.isActive) {
      return next(new ErrorResponse(`Bu işletme artık aktif değil`, 404));
    }
    
    res.status(200).json({
      success: true,
      data: business
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Yeni işletme oluştur
 * @route   POST /api/businesses
 * @access  Private (Business, Admin)
 */
exports.createBusiness = async (req, res, next) => {
  try {
    // İşletme sahibini oturum açan kullanıcı olarak ayarla
    req.body.owner = req.user.id;
    
    // Varsayılan çalışma saatlerini ekle
    if (!req.body.workingHours || req.body.workingHours.length === 0) {
      const days = ['pazartesi', 'salı', 'çarşamba', 'perşembe', 'cuma', 'cumartesi', 'pazar'];
      req.body.workingHours = days.map(day => ({
        day,
        isOpen: day !== 'pazar',
        openTime: '09:00',
        closeTime: '18:00'
      }));
    }
    
    // Eğer kullanıcı admin değilse, bir kullanıcı sadece bir işletme oluşturabilir
    if (req.user.role !== 'admin') {
      const existingBusiness = await Business.findOne({ owner: req.user.id });
      
      if (existingBusiness) {
        return next(new ErrorResponse('Bir kullanıcı sadece bir işletme ekleyebilir', 400));
      }
    }
    
    const business = await Business.create(req.body);
    
    res.status(201).json({
      success: true,
      data: business
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    İşletme güncelle
 * @route   PUT /api/businesses/:id
 * @access  Private (İşletme sahibi, Admin)
 */
exports.updateBusiness = async (req, res, next) => {
  try {
    let business = await Business.findById(req.params.id);
    
    if (!business) {
      return next(new ErrorResponse(`${req.params.id} ID'li işletme bulunamadı`, 404));
    }
    
    // İşletme sahibinin veya admin'in güncelleme yapabilmesi
    if (business.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Bu işletmeyi güncelleme yetkiniz yok', 403));
    }
    
    // owner alanının değiştirilmesini engelle
    if (req.body.owner && req.body.owner !== business.owner.toString() && req.user.role !== 'admin') {
      return next(new ErrorResponse('İşletme sahibini değiştiremezsiniz', 403));
    }
    
    business = await Business.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: business
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    İşletme sil (veya pasif hale getir)
 * @route   DELETE /api/businesses/:id
 * @access  Private (İşletme sahibi, Admin)
 */
exports.deleteBusiness = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id);
    
    if (!business) {
      return next(new ErrorResponse(`${req.params.id} ID'li işletme bulunamadı`, 404));
    }
    
    // İşletme sahibinin veya admin'in silme yapabilmesi
    if (business.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Bu işletmeyi silme yetkiniz yok', 403));
    }
    
    // Gerçekten silmek yerine pasif hale getir
    business.isActive = false;
    await business.save();
    
    res.status(200).json({
      success: true,
      data: {},
      message: 'İşletme pasif hale getirildi'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Belirli bir konuma yakın işletmeleri getir
 * @route   GET /api/businesses/radius/:zipcode/:distance
 * @access  Public
 */
exports.getBusinessesInRadius = async (req, res, next) => {
  try {
    const { latitude, longitude, distance } = req.params;
    
    // Dünya yarıçapı: 6378 km
    const radius = distance / 6378;
    
    const businesses = await Business.find({
      'address.location': {
        $geoWithin: { $centerSphere: [[longitude, latitude], radius] }
      },
      isActive: true
    });
    
    res.status(200).json({
      success: true,
      count: businesses.length,
      data: businesses
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    İşletmeyi aktif hale getir (onaylama)
 * @route   PUT /api/businesses/:id/activate
 * @access  Private (Admin)
 */
exports.activateBusiness = async (req, res, next) => {
  try {
    let business = await Business.findById(req.params.id);
    
    if (!business) {
      return next(new ErrorResponse(`${req.params.id} ID'li işletme bulunamadı`, 404));
    }
    
    business.isActive = true;
    await business.save();
    
    res.status(200).json({
      success: true,
      data: business
    });
  } catch (err) {
    next(err);
  }
}; 