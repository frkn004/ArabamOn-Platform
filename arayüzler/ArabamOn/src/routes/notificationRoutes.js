const express = require('express');
const router = express.Router();
const { User, Notification } = require('../models');
const jwt = require('jsonwebtoken');

/**
 * @route   GET /api/notifications
 * @desc    Kullanıcının bildirimlerini getir
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
      
      // Kullanıcı bildirimlerini getir
      const notifications = await Notification.findAll({
        where: { userId: decoded.id },
        order: [['createdAt', 'DESC']]
      });
      
      res.status(200).json({
        success: true,
        count: notifications.length,
        data: notifications
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Bildirimi okundu olarak işaretle
 * @access  Private
 */
router.put('/:id/read', async (req, res) => {
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
      
      // Bildirimi getir
      const notification = await Notification.findByPk(req.params.id);
      
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Bildirim bulunamadı'
        });
      }
      
      // Kullanıcı kendi bildirimini güncelleyebilir
      if (notification.userId !== decoded.id) {
        return res.status(403).json({
          success: false,
          message: 'Bu bildirimi okuma izniniz yok'
        });
      }
      
      // Bildirimi güncelle
      notification.isRead = true;
      await notification.save();
      
      res.status(200).json({
        success: true,
        message: 'Bildirim okundu olarak işaretlendi',
        data: notification
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }
  } catch (error) {
    console.error('Read notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Tüm bildirimleri okundu olarak işaretle
 * @access  Private
 */
router.put('/read-all', async (req, res) => {
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
      
      // Tüm okunmamış bildirimleri getir
      const unreadNotifications = await Notification.findAll({
        where: { 
          userId: decoded.id,
          isRead: false
        }
      });
      
      // Bildirimleri güncelle
      for (const notification of unreadNotifications) {
        notification.isRead = true;
        await notification.save();
      }
      
      res.status(200).json({
        success: true,
        message: 'Tüm bildirimler okundu olarak işaretlendi',
        count: unreadNotifications.length
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }
  } catch (error) {
    console.error('Read all notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

module.exports = router; 