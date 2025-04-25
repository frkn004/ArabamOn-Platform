const ServiceProvider = require('../models/ServiceProvider');
const User = require('../models/User');
const Service = require('../models/Service');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Tüm hizmet sağlayıcıları getir
// @route   GET /api/providers
// @access  Public
exports.getProviders = async (req, res) => {
  try {
    const query = { approved: true };
    const { category, specialty } = req.query;
    
    // Kategori filtresi
    if (category) {
      // Kategoriye göre servis sağlayıcıları bul
      // Önce bu kategorideki hizmetleri sunan provider ID'lerini bulalım
      const services = await Service.find({ category }).distinct('provider');
      
      if (services.length > 0) {
        query._id = { $in: services };
      }
    }
    
    // Uzmanlık alanına göre filtreleme
    if (specialty) {
      query.specialties = specialty;
    }
    
    const providers = await ServiceProvider.find(query).populate('user', 'name email');

    res.status(200).json({
      success: true,
      count: providers.length,
      data: providers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Tek hizmet sağlayıcı getir
// @route   GET /api/providers/:id
// @access  Public
exports.getProvider = async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id).populate('user', 'name email');

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Hizmet sağlayıcı bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: provider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Hizmet sağlayıcı oluştur
// @route   POST /api/providers
// @access  Private
exports.createProvider = async (req, res) => {
  try {
    // Kullanıcının zaten bir hizmet sağlayıcı olup olmadığını kontrol et
    const existingProvider = await ServiceProvider.findOne({ user: req.user.id });
    
    if (existingProvider) {
      return res.status(400).json({
        success: false,
        message: 'Bu kullanıcı zaten bir hizmet sağlayıcı'
      });
    }
    
    // Yeni hizmet sağlayıcı oluştur
    req.body.user = req.user.id;
    
    const provider = await ServiceProvider.create(req.body);
    
    // Kullanıcı rolünü güncelle
    await User.findByIdAndUpdate(req.user.id, { role: 'provider' });
    
    res.status(201).json({
      success: true,
      data: provider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Hizmet sağlayıcı güncelle
// @route   PUT /api/providers/:id
// @access  Private
exports.updateProvider = async (req, res) => {
  try {
    let provider = await ServiceProvider.findById(req.params.id);
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Hizmet sağlayıcı bulunamadı'
      });
    }
    
    // Hizmet sağlayıcının sahibi veya admin mi kontrol et
    if (provider.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Bu işlemi yapmaya yetkiniz yok'
      });
    }
    
    provider = await ServiceProvider.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: provider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Hizmet sağlayıcıyı onayla
// @route   PUT /api/providers/:id/approve
// @access  Private/Admin
exports.approveProvider = async (req, res) => {
  try {
    const provider = await ServiceProvider.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Hizmet sağlayıcı bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: provider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Konuma göre hizmet sağlayıcıları bul
// @route   GET /api/providers/radius/:zipcode/:distance
// @access  Public
exports.getProvidersInRadius = async (req, res) => {
  try {
    const { lat, lng, distance } = req.params;
    
    // Dünya yarıçapı: 6378 km
    const radius = distance / 6378;
    
    const providers = await ServiceProvider.find({
      location: {
        $geoWithin: { $centerSphere: [[lng, lat], radius] }
      },
      approved: true
    });
    
    res.status(200).json({
      success: true,
      count: providers.length,
      data: providers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Kullanıcının kendi servis sağlayıcı profilini getir
// @route   GET /api/providers/me
// @access  Private/Provider
exports.getMe = async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ user: req.user.id });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Servis sağlayıcı profili bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: provider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Google Maps bağlantısını güncelle
// @route   PUT /api/providers/:id/maps-link
// @access  Private/Provider
exports.updateMapsLink = async (req, res) => {
  try {
    const { googleMapsLink } = req.body;
    
    if (!googleMapsLink) {
      return res.status(400).json({
        success: false,
        message: 'Google Maps bağlantısı gereklidir'
      });
    }
    
    // Basit bir Google Maps bağlantı validasyonu
    if (!googleMapsLink.includes('google.com/maps')) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir Google Maps bağlantısı giriniz'
      });
    }
    
    let provider = await ServiceProvider.findById(req.params.id);
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Hizmet sağlayıcı bulunamadı'
      });
    }
    
    // Yetkisi var mı kontrol et
    if (provider.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Bu işlemi yapmaya yetkiniz yok'
      });
    }
    
    provider.googleMapsLink = googleMapsLink;
    await provider.save();
    
    res.status(200).json({
      success: true,
      data: provider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

/**
 * @desc    Servis sağlayıcının zaman dilimlerini güncelle
 * @route   PUT /api/v1/serviceproviders/:id/timeslots
 * @access  Private (Servis sağlayıcı sahibi ve Admin)
 */
exports.updateTimeSlots = asyncHandler(async (req, res, next) => {
  const serviceProvider = await ServiceProvider.findById(req.params.id);

  if (!serviceProvider) {
    return next(
      new ErrorResponse(`ID'si ${req.params.id} olan servis sağlayıcı bulunamadı`, 404)
    );
  }

  // Servis sağlayıcı sahibi veya admin kontrolü
  if (
    serviceProvider.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `ID'si ${req.user.id} olan kullanıcının bu servisi güncelleme yetkisi yok`,
        403
      )
    );
  }

  // Zaman dilimlerini güncelle
  const updatedServiceProvider = await ServiceProvider.findByIdAndUpdate(
    req.params.id,
    { timeSlots: req.body.timeSlots },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: updatedServiceProvider
  });
});

/**
 * @desc    Servis sağlayıcının zaman dilimlerini getir
 * @route   GET /api/v1/serviceproviders/:id/timeslots
 * @access  Public
 */
exports.getTimeSlots = asyncHandler(async (req, res, next) => {
  const serviceProvider = await ServiceProvider.findById(req.params.id);

  if (!serviceProvider) {
    return next(
      new ErrorResponse(`ID'si ${req.params.id} olan servis sağlayıcı bulunamadı`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: serviceProvider.timeSlots
  });
});

// @desc    Uygun zaman dilimlerini getir
// @route   GET /api/providers/:id/available-timeslots/:date
// @access  Public
exports.getAvailableTimeSlots = async (req, res) => {
  try {
    const { id, date } = req.params;
    
    // ID'ye göre hizmet sağlayıcıyı bul
    const provider = await ServiceProvider.findById(id);
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Hizmet sağlayıcı bulunamadı'
      });
    }
    
    // Tarih formatını kontrol et
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz tarih formatı'
      });
    }
    
    // Haftanın gününü bul (0: Pazar, 1: Pazartesi, ...)
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[selectedDate.getDay()];
    
    // Seçilen güne ait zaman dilimlerini bul
    const dayTimeSlots = provider.timeSlots.find(ts => ts.day === dayOfWeek);
    
    if (!dayTimeSlots || !dayTimeSlots.slots) {
      return res.status(404).json({
        success: false,
        message: 'Bu gün için tanımlanmış zaman dilimleri bulunamadı'
      });
    }
    
    // Müsait zaman dilimlerini filtrele
    const availableSlots = dayTimeSlots.slots.filter(slot => slot.available);
    
    res.status(200).json({
      success: true,
      day: dayOfWeek,
      date: selectedDate,
      data: availableSlots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Servis sağlayıcı durumunu (açık/kapalı) değiştir
// @route   PUT /api/providers/:id/status
// @access  Private/Provider
exports.toggleProviderStatus = async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id);
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Hizmet sağlayıcı bulunamadı'
      });
    }
    
    // Yetkisi var mı kontrol et
    if (provider.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Bu işlemi yapmaya yetkiniz yok'
      });
    }
    
    // Durumu değiştir
    provider.isOpen = !provider.isOpen;
    await provider.save();
    
    res.status(200).json({
      success: true,
      data: provider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
}; 