const ServiceProvider = require('../models/ServiceProvider');
const User = require('../models/User');
const Service = require('../models/Service');

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