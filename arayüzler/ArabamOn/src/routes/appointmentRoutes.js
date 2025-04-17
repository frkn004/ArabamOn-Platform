const express = require('express');
const router = express.Router();
const { Appointment, User, Business, Service, Notification } = require('../models');
const jwt = require('jsonwebtoken');

/**
 * @route   GET /api/appointments
 * @desc    Kullanıcının tüm randevularını getir
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    // Token kontrolü
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
      
      // Kullanıcı randevularını getir
      const appointments = await Appointment.findAll({
        where: { userId: decoded.id },
        include: [
          {
            model: Business,
            attributes: ['id', 'name', 'type', 'city', 'district']
          },
          {
            model: Service,
            attributes: ['id', 'name', 'price', 'duration']
          }
        ],
        order: [['date', 'DESC'], ['time', 'DESC']]
      });
      
      res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/appointments/:id
 * @desc    ID'ye göre randevuyu getir
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    // Token kontrolü
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
      
      // Randevuyu getir
      const appointment = await Appointment.findByPk(req.params.id, {
        include: [
          {
            model: Business,
            attributes: ['id', 'name', 'type', 'city', 'district', 'phone', 'email']
          },
          {
            model: Service,
            attributes: ['id', 'name', 'price', 'duration', 'description']
          },
          {
            model: User,
            attributes: ['id', 'name', 'email', 'phone']
          }
        ]
      });
      
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Randevu bulunamadı'
        });
      }
      
      // Kullanıcı kendi randevusunu veya işletme sahibi kendi işletmesinin randevusunu görebilir
      const isOwner = appointment.userId === decoded.id;
      const isBusiness = decoded.role === 'business' && appointment.Business.ownerId === decoded.id;
      const isAdmin = decoded.role === 'admin';
      
      if (!isOwner && !isBusiness && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Bu randevuya erişim izniniz yok'
        });
      }
      
      res.status(200).json({
        success: true,
        data: appointment
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/appointments
 * @desc    Yeni randevu oluştur
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    // Token kontrolü
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
      
      const { businessId, serviceId, date, time, notes } = req.body;
      
      // Gerekli alanları kontrol et
      if (!businessId || !serviceId || !date || !time) {
        return res.status(400).json({
          success: false,
          message: 'Tüm zorunlu alanları doldurun'
        });
      }
      
      // İşletme ve hizmet kontrolü
      const business = await Business.findByPk(businessId);
      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'İşletme bulunamadı'
        });
      }
      
      const service = await Service.findByPk(serviceId);
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Hizmet bulunamadı'
        });
      }
      
      // Randevu oluştur
      const appointment = await Appointment.create({
        userId: decoded.id,
        businessId,
        serviceId,
        date,
        time,
        notes: notes || '',
        status: 'beklemede'
      });
      
      // İşletme sahibine bildirim gönder
      const businessOwner = await User.findByPk(business.ownerId);
      if (businessOwner) {
        await Notification.create({
          userId: businessOwner.id,
          title: 'Yeni Randevu Talebi',
          message: `${date} tarihinde saat ${time} için yeni bir randevu oluşturuldu.`,
          type: 'appointment',
          isRead: false,
          relatedId: appointment.id
        });
      }
      
      // Admin kullanıcılarına bildirim gönder
      const admins = await User.findAll({
        where: { role: 'admin' }
      });
      
      // Tüm admin kullanıcılarına bildirim gönder
      for (const admin of admins) {
        await Notification.create({
          userId: admin.id,
          title: 'Yeni Randevu Kaydı',
          message: `${business.name} işletmesine ${date} tarihinde saat ${time} için yeni bir randevu oluşturuldu.`,
          type: 'appointment',
          isRead: false,
          relatedId: appointment.id
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Randevu başarıyla oluşturuldu',
        data: appointment
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/appointments/:id
 * @desc    Randevu durumunu güncelle
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
    // Token kontrolü
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
      
      const { status, cancelReason, notes } = req.body;
      
      // Randevuyu getir
      const appointment = await Appointment.findByPk(req.params.id, {
        include: [
          {
            model: Business,
            attributes: ['ownerId']
          }
        ]
      });
      
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Randevu bulunamadı'
        });
      }
      
      // Kullanıcı kendi randevusunu veya işletme sahibi kendi işletmesinin randevusunu güncelleyebilir
      const isOwner = appointment.userId === decoded.id;
      const isBusiness = decoded.role === 'business' && appointment.Business.ownerId === decoded.id;
      const isAdmin = decoded.role === 'admin';
      
      if (!isOwner && !isBusiness && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Bu randevuyu güncelleme izniniz yok'
        });
      }
      
      // Randevuyu güncelle
      const updateData = {};
      
      if (status) updateData.status = status;
      if (notes) updateData.notes = notes;
      if (status === 'iptal' && cancelReason) updateData.cancelReason = cancelReason;
      
      await appointment.update(updateData);
      
      // Güncellenmiş randevuyu getir
      const updatedAppointment = await Appointment.findByPk(req.params.id, {
        include: [
          {
            model: Business,
            attributes: ['id', 'name', 'type']
          },
          {
            model: Service,
            attributes: ['id', 'name', 'price', 'duration']
          }
        ]
      });
      
      res.status(200).json({
        success: true,
        message: 'Randevu başarıyla güncellendi',
        data: updatedAppointment
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/appointments/business/:businessId
 * @desc    İşletmeye göre randevuları getir
 * @access  Private (business owner or admin)
 */
router.get('/business/:businessId', async (req, res) => {
  try {
    // Token kontrolü
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
      
      const { businessId } = req.params;
      
      // İşletmeyi kontrol et
      const business = await Business.findByPk(businessId);
      
      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'İşletme bulunamadı'
        });
      }
      
      // Sadece işletme sahibi veya admin görebilir
      const isBusiness = decoded.role === 'business' && business.ownerId === decoded.id;
      const isAdmin = decoded.role === 'admin';
      
      if (!isBusiness && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Bu işletmenin randevularını görme izniniz yok'
        });
      }
      
      // İşletme randevularını getir
      const appointments = await Appointment.findAll({
        where: { businessId },
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email', 'phone']
          },
          {
            model: Service,
            attributes: ['id', 'name', 'price', 'duration']
          }
        ],
        order: [['date', 'DESC'], ['time', 'DESC']]
      });
      
      res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }
  } catch (error) {
    console.error('Get business appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

// Admin rotası: Tüm randevuları getir
router.get('/admin/all', async (req, res) => {
  try {
    // Token kontrolü
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
      
      // Sadece admin erişebilir
      if (decoded.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Bu işlemi gerçekleştirmek için admin yetkiniz yok'
        });
      }
      
      // Tüm randevuları getir
      const appointments = await Appointment.findAll({
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email', 'phone']
          },
          {
            model: Business,
            attributes: ['id', 'name', 'type', 'city', 'district']
          },
          {
            model: Service,
            attributes: ['id', 'name', 'price', 'duration']
          }
        ],
        order: [['date', 'DESC'], ['time', 'DESC']]
      });
      
      res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }
  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

module.exports = router; 