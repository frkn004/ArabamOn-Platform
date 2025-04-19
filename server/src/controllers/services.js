const Service = require('../models/Service');
const ServiceProvider = require('../models/ServiceProvider');

// @desc    Tüm hizmetleri getir
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res) => {
  try {
    // Kategori filtreleme
    let query = {};
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Aktif hizmetleri filtrele
    query.isActive = true;
    
    const services = await Service.find(query).populate({
      path: 'provider',
      select: 'companyName location contactPhone averageRating'
    });
    
    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Tek hizmet getir
// @route   GET /api/services/:id
// @access  Public
exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate({
      path: 'provider',
      select: 'companyName description address contactPhone workingHours photos'
    });
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Hizmet bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Hizmet sağlayıcının hizmetlerini getir
// @route   GET /api/services/provider/:providerId
// @access  Public
exports.getProviderServices = async (req, res) => {
  try {
    const services = await Service.find({
      provider: req.params.providerId,
      isActive: true
    });
    
    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Hizmet oluştur
// @route   POST /api/services
// @access  Private/Provider
exports.createService = async (req, res) => {
  try {
    // Kullanıcının hizmet sağlayıcısını bul
    const provider = await ServiceProvider.findOne({ user: req.user.id });
    
    if (!provider) {
      return res.status(400).json({
        success: false,
        message: 'Önce hizmet sağlayıcı profilinizi oluşturmalısınız'
      });
    }
    
    // Onaysız hizmet sağlayıcı kontrolü
    if (!provider.approved && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Hizmet eklemek için önce profilinizin onaylanması gerekiyor'
      });
    }
    
    // Hizmet sağlayıcı ID'sini ekle
    req.body.provider = provider._id;
    
    const service = await Service.create(req.body);
    
    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Hizmet güncelle
// @route   PUT /api/services/:id
// @access  Private/Provider
exports.updateService = async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Hizmet bulunamadı'
      });
    }
    
    // Hizmet sağlayıcı kontrolü
    const provider = await ServiceProvider.findOne({ user: req.user.id });
    
    // Hizmet sahibi veya admin değilse
    if (service.provider.toString() !== provider._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Bu işlemi yapmaya yetkiniz yok'
      });
    }
    
    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Hizmet sil
// @route   DELETE /api/services/:id
// @access  Private/Provider
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Hizmet bulunamadı'
      });
    }
    
    // Hizmet sağlayıcı kontrolü
    const provider = await ServiceProvider.findOne({ user: req.user.id });
    
    // Hizmet sahibi veya admin değilse
    if (service.provider.toString() !== provider._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Bu işlemi yapmaya yetkiniz yok'
      });
    }
    
    await service.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Hizmet silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Kategori bazlı hizmet şablonları getir
// @route   GET /api/services/templates
// @access  Private/Provider
exports.getServiceTemplates = async (req, res) => {
  try {
    const { category } = req.query;
    
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Kategori belirtilmelidir'
      });
    }
    
    // Her kategori için hazır şablonlar
    const templates = {
      'Araç Yıkama': [
        { name: 'İç Dış Yıkama', description: 'Aracınızın iç ve dış bölümlerinin detaylı temizliği', price: 250, duration: 60 },
        { name: 'Dış Yıkama', description: 'Aracınızın dış bölümünün hızlı yıkaması', price: 120, duration: 30 },
        { name: 'Detaylı İç Temizlik', description: 'Aracınızın iç bölümünün detaylı temizliği', price: 200, duration: 45 }
      ],
      'Teknik Muayene': [
        { name: 'Araç Muayene Hazırlık', description: 'Aracınızın teknik muayeneye hazırlanması', price: 350, duration: 90 },
        { name: 'Motor Testi', description: 'Aracınızın motor performans testi', price: 250, duration: 60 }
      ],
      'Lastik Değişimi': [
        { name: '4 Lastik Değişimi', description: '4 lastiğin değişimi ve balans ayarı', price: 300, duration: 60 },
        { name: '2 Lastik Değişimi', description: '2 lastiğin değişimi ve balans ayarı', price: 150, duration: 30 }
      ],
      'Otopark': [
        { name: 'Günlük Otopark', description: '24 saatlik kapalı otopark hizmeti', price: 100, duration: 1440 },
        { name: 'Haftalık Otopark', description: '7 günlük kapalı otopark hizmeti', price: 600, duration: 10080 }
      ],
      'Bakım': [
        { name: 'Yağ Değişimi', description: 'Motor yağı ve filtre değişimi', price: 500, duration: 60 },
        { name: '10.000 KM Bakımı', description: 'Tüm sıvılar ve filtreler dahil periyodik bakım', price: 950, duration: 120 },
        { name: '20.000 KM Bakımı', description: 'Kapsamlı bakım, tüm sıvı ve filtreler dahil', price: 1200, duration: 180 }
      ],
      'Onarım': [
        { name: 'Akü Değişimi', description: 'Yeni akü montajı ve elektrik sistem kontrolü', price: 1500, duration: 30 },
        { name: 'Fren Sistemi Tamiri', description: 'Fren balatası ve diski değişimi', price: 800, duration: 120 }
      ],
      'Diğer': [
        { name: 'Seyyar Yol Yardım', description: 'Arızalanan araçlar için yol yardımı', price: 500, duration: 120 },
        { name: 'Ekspertiz Raporu', description: 'Detaylı araç ekspertiz raporu', price: 600, duration: 180 }
      ]
    };
    
    // İlgili kategorinin şablonlarını getir
    const categoryTemplates = templates[category] || [];
    
    // Şablonlara ID ekle
    const templatesWithIds = categoryTemplates.map((template, index) => ({
      _id: `template_${category}_${index}`,
      ...template,
      category
    }));
    
    res.status(200).json({
      success: true,
      count: templatesWithIds.length,
      data: templatesWithIds
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
}; 