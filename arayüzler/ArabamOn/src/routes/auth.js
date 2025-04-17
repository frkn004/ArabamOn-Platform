const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * @route   POST /api/auth/register
 * @desc    Kullanıcı kaydı
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role = 'user' } = req.body;
    
    // Email kontrolü
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Bu e-posta adresi zaten kullanılıyor'
      });
    }
    
    // Şifre hashleme
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Kullanıcı oluştur
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: ['user', 'business', 'admin'].includes(role) ? role : 'user',
      isActive: true
    });
    
    // Kullanıcı bilgilerinden şifreyi çıkar
    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    };
    
    // JWT token oluştur
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      token,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Kullanıcı girişi
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Email ile kullanıcıyı bul
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz e-posta veya şifre'
      });
    }
    
    // Şifre kontrolü
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz e-posta veya şifre'
      });
    }
    
    // Kullanıcı aktif değilse
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hesabınız askıya alınmıştır. Lütfen yönetici ile iletişime geçin'
      });
    }
    
    // Kullanıcı bilgilerinden şifreyi çıkar
    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    };
    
    // JWT token oluştur
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );
    
    res.status(200).json({
      success: true,
      message: 'Giriş başarılı',
      token,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Mevcut kullanıcı bilgilerini getir
 * @access  Private
 */
router.get('/me', async (req, res) => {
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
      
      // Kullanıcıyı bul
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Kullanıcı bulunamadı'
        });
      }
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }
  } catch (error) {
    console.error('Auth/me error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/auth/updatedetails
 * @desc    Kullanıcı bilgilerini güncelle
 * @access  Private
 */
router.put('/updatedetails', async (req, res) => {
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
      
      // Kullanıcıyı bul
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Kullanıcı bulunamadı'
        });
      }
      
      // Güncellenecek alanlar
      const { name, email, phone } = req.body;
      
      // Email değişiyorsa benzersiz olmalı
      if (email && email !== user.email) {
        const emailExists = await User.findOne({ where: { email } });
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: 'Bu e-posta adresi zaten kullanılıyor'
          });
        }
      }
      
      // Kullanıcıyı güncelle
      const updatedUser = await user.update({
        name: name || user.name,
        email: email || user.email,
        phone: phone || user.phone
      });
      
      // Şifreyi çıkar
      const userWithoutPassword = {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      };
      
      res.status(200).json({
        success: true,
        message: 'Kullanıcı bilgileri başarıyla güncellendi',
        data: userWithoutPassword
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }
  } catch (error) {
    console.error('Update details error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/auth/updatepassword
 * @desc    Kullanıcı şifresini güncelle
 * @access  Private
 */
router.put('/updatepassword', async (req, res) => {
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
      
      // Kullanıcıyı bul
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Kullanıcı bulunamadı'
        });
      }
      
      // Şifre alanlarını kontrol et
      const { currentPassword, newPassword } = req.body;
      
      // Mevcut şifreyi kontrol et
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Mevcut şifre yanlış'
        });
      }
      
      // Yeni şifreyi hashle
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Şifreyi güncelle
      await user.update({
        password: hashedPassword
      });
      
      res.status(200).json({
        success: true,
        message: 'Şifre başarıyla güncellendi'
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

module.exports = router;