const express = require('express');
const router = express.Router();
const { Business, Service, Review, WorkingHour, User } = require('../models');
const { Op } = require('sequelize');

/**
 * @route   GET /api/businesses
 * @desc    Tüm işletmeleri getir (filtrele ve sırala)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { 
      location, 
      category, 
      name, 
      service, 
      rating,
      sort = 'name',
      page = 1,
      limit = 10 
    } = req.query;
    
    // Filtreleme koşulları
    const whereConditions = {
      isActive: true // Sadece aktif işletmeler
    };
    
    // İsim araması
    if (name) {
      whereConditions.name = {
        [Op.like]: `%${name}%`
      };
    }
    
    // Konum araması (şehir veya ilçe)
    if (location) {
      whereConditions[Op.or] = [
        { city: { [Op.like]: `%${location}%` } },
        { district: { [Op.like]: `%${location}%` } }
      ];
    }
    
    // Kategori araması
    if (category) {
      whereConditions.type = {
        [Op.like]: `%${category}%`
      };
    }
    
    // Derecelendirme filtrelemesi
    if (rating) {
      whereConditions.averageRating = {
        [Op.gte]: parseFloat(rating)
      };
    }
    
    // Sayfalama
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Sıralama
    let order;
    switch (sort) {
      case 'rating':
        order = [['averageRating', 'DESC']];
        break;
      case 'popularity':
        order = [['reviewCount', 'DESC']];
        break;
      case 'name':
      default:
        order = [['name', 'ASC']];
    }
    
    // İşletmeleri getir
    const businesses = await Business.findAndCountAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset,
      order,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ],
      distinct: true
    });
    
    // Sayfalama bilgisi
    const totalPages = Math.ceil(businesses.count / parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: businesses.count,
      pagination: {
        totalPages,
        currentPage: parseInt(page),
        totalItems: businesses.count,
        itemsPerPage: parseInt(limit)
      },
      data: businesses.rows
    });
  } catch (error) {
    console.error('Get businesses error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/businesses/:id
 * @desc    Tek bir işletmeyi getir
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const businessId = req.params.id;
    
    // İşletmeyi getir
    const business = await Business.findByPk(businessId, {
      include: [
        {
          model: WorkingHour,
          attributes: ['day', 'isOpen', 'openTime', 'closeTime']
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'İşletme bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: business
    });
  } catch (error) {
    console.error('Get business error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/businesses/:id/services
 * @desc    İşletmenin hizmetlerini getir
 * @access  Public
 */
router.get('/:id/services', async (req, res) => {
  try {
    const businessId = req.params.id;
    
    // İşletmenin varlığını kontrol et
    const business = await Business.findByPk(businessId);
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'İşletme bulunamadı'
      });
    }
    
    // İşletmenin hizmetlerini getir
    const services = await Service.findAll({
      where: {
        businessId,
        isActive: true
      },
      order: [['price', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Get business services error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/businesses/:id/reviews
 * @desc    İşletmenin değerlendirmelerini getir
 * @access  Public
 */
router.get('/:id/reviews', async (req, res) => {
  try {
    const businessId = req.params.id;
    const { page = 1, limit = 10 } = req.query;
    
    // İşletmenin varlığını kontrol et
    const business = await Business.findByPk(businessId);
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'İşletme bulunamadı'
      });
    }
    
    // Sayfalama
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // İşletmenin değerlendirmelerini getir
    const reviews = await Review.findAndCountAll({
      where: {
        businessId,
        isApproved: true
      },
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['id', 'name']
        }
      ]
    });
    
    // Sayfalama bilgisi
    const totalPages = Math.ceil(reviews.count / parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: reviews.count,
      pagination: {
        totalPages,
        currentPage: parseInt(page),
        totalItems: reviews.count,
        itemsPerPage: parseInt(limit)
      },
      data: reviews.rows
    });
  } catch (error) {
    console.error('Get business reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/businesses
 * @desc    Yeni işletme oluştur
 * @access  Private (business veya admin)
 */
router.post('/', async (req, res) => {
  try {
    // Gerçek uygulamada bu middleware ile korunmalı
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme hatası. Token bulunamadı'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      // Token'ı doğrula
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      
      // Sadece business veya admin rolüne sahip kullanıcılar işletme oluşturabilir
      if (decoded.role !== 'business' && decoded.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Yetkiniz yok. Sadece işletme sahipleri ve yöneticiler işletme oluşturabilir'
        });
      }
      
      // İşletme bilgileri
      const {
        name,
        type,
        email,
        phone,
        street,
        city,
        district,
        latitude,
        longitude,
        description,
        workingHours
      } = req.body;
      
      // İşletme oluştur
      const business = await Business.create({
        name,
        type,
        email,
        phone,
        street,
        city,
        district,
        latitude: latitude || 0,
        longitude: longitude || 0,
        description,
        ownerId: decoded.id,
        isActive: true
      });
      
      // Çalışma saatlerini ekle (varsa)
      if (workingHours && Array.isArray(workingHours)) {
        const workingHoursData = workingHours.map(hour => ({
          ...hour,
          businessId: business.id
        }));
        
        await WorkingHour.bulkCreate(workingHoursData);
      }
      
      res.status(201).json({
        success: true,
        message: 'İşletme başarıyla oluşturuldu',
        data: business
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }
  } catch (error) {
    console.error('Create business error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/businesses/:id
 * @desc    İşletme bilgilerini güncelle
 * @access  Private (owner veya admin)
 */
router.put('/:id', async (req, res) => {
  try {
    // Gerçek uygulamada bu middleware ile korunmalı
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme hatası. Token bulunamadı'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      // Token'ı doğrula
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      
      const businessId = req.params.id;
      
      // İşletmeyi getir
      const business = await Business.findByPk(businessId);
      
      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'İşletme bulunamadı'
        });
      }
      
      // Yetkiyi kontrol et (sadece işletme sahibi veya admin güncelleyebilir)
      if (business.ownerId !== decoded.id && decoded.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Yetkiniz yok. Sadece işletme sahibi veya yöneticiler güncelleyebilir'
        });
      }
      
      // Güncellenecek alanlar
      const {
        name,
        type,
        email,
        phone,
        street,
        city,
        district,
        latitude,
        longitude,
        description,
        isActive
      } = req.body;
      
      // İşletmeyi güncelle
      await business.update({
        name: name || business.name,
        type: type || business.type,
        email: email || business.email,
        phone: phone || business.phone,
        street: street || business.street,
        city: city || business.city,
        district: district || business.district,
        latitude: latitude !== undefined ? latitude : business.latitude,
        longitude: longitude !== undefined ? longitude : business.longitude,
        description: description !== undefined ? description : business.description,
        isActive: isActive !== undefined ? isActive : business.isActive
      });
      
      // Çalışma saatlerini güncelle (varsa)
      if (req.body.workingHours && Array.isArray(req.body.workingHours)) {
        // Mevcut çalışma saatlerini sil
        await WorkingHour.destroy({ 
          where: { businessId }
        });
        
        // Yeni çalışma saatlerini ekle
        const workingHoursData = req.body.workingHours.map(hour => ({
          ...hour,
          businessId
        }));
        
        await WorkingHour.bulkCreate(workingHoursData);
      }
      
      // Güncellenmiş işletmeyi getir
      const updatedBusiness = await Business.findByPk(businessId, {
        include: [
          {
            model: WorkingHour,
            attributes: ['day', 'isOpen', 'openTime', 'closeTime']
          }
        ]
      });
      
      res.status(200).json({
        success: true,
        message: 'İşletme başarıyla güncellendi',
        data: updatedBusiness
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }
  } catch (error) {
    console.error('Update business error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/businesses/:id
 * @desc    İşletmeyi sil
 * @access  Private (owner veya admin)
 */
router.delete('/:id', async (req, res) => {
  try {
    // Gerçek uygulamada bu middleware ile korunmalı
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme hatası. Token bulunamadı'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      // Token'ı doğrula
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      
      const businessId = req.params.id;
      
      // İşletmeyi getir
      const business = await Business.findByPk(businessId);
      
      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'İşletme bulunamadı'
        });
      }
      
      // Yetkiyi kontrol et (sadece işletme sahibi veya admin silebilir)
      if (business.ownerId !== decoded.id && decoded.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Yetkiniz yok. Sadece işletme sahibi veya yöneticiler silebilir'
        });
      }
      
      // İşletmeyi sil
      await business.destroy();
      
      res.status(200).json({
        success: true,
        message: 'İşletme başarıyla silindi'
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }
  } catch (error) {
    console.error('Delete business error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

module.exports = router; 