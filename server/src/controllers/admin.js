const User = require('../models/User');
const ServiceProvider = require('../models/ServiceProvider');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const { createNotification } = require('./notifications');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Admin istatistikleri getir
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res) => {
  try {
    const users = await User.countDocuments({ role: 'user' });
    const providers = await ServiceProvider.countDocuments();
    const services = await Service.countDocuments();
    const appointments = await Appointment.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        users,
        providers,
        services,
        appointments
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Tüm hizmetleri getir
// @route   GET /api/admin/services
// @access  Private/Admin
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find()
      .populate({
        path: 'provider',
        select: 'companyName address'
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

// @desc    Tüm kullanıcıları getir
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Tüm servis sağlayıcıları getir
// @route   GET /api/admin/providers
// @access  Private/Admin
exports.getServiceProviders = async (req, res) => {
  try {
    const query = {};
    
    // Filtreleri uygula
    if (req.query.approved === 'true') {
      query.approved = true;
    } else if (req.query.approved === 'false') {
      query.approved = false;
    } else if (req.query.approved === 'pending') {
      query.approved = null;
    }
    
    const providers = await ServiceProvider.find(query).populate({
      path: 'user',
      select: 'email role'
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

// @desc    Servis sağlayıcı onayını güncelle
// @route   PUT /api/admin/providers/:id/approval
// @access  Private/Admin
exports.updateProviderApproval = async (req, res) => {
  try {
    const { approved } = req.body;
    
    if (approved === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Onay durumu belirtilmedi'
      });
    }
    
    const provider = await ServiceProvider.findByIdAndUpdate(
      req.params.id,
      { approved },
      { new: true, runValidators: true }
    );
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Servis sağlayıcı bulunamadı'
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

// @desc    Tüm randevuları getir
// @route   GET /api/admin/appointments
// @access  Private/Admin
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate({
        path: 'provider',
        select: 'name address phone'
      })
      .populate({
        path: 'service',
        select: 'name price duration'
      });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Firma ekle
// @route   POST /api/admin/providers
// @access  Private/Admin
exports.createServiceProvider = async (req, res) => {
  try {
    // Provider oluştur
    const provider = await ServiceProvider.create(req.body);

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

// @desc    Firma sil
// @route   DELETE /api/admin/providers/:id
// @access  Private/Admin
exports.deleteServiceProvider = async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id);
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Servis sağlayıcı bulunamadı'
      });
    }
    
    // İlişkili servisleri sil
    await Service.deleteMany({ provider: req.params.id });
    
    // İlişkili randevuları sil
    await Appointment.deleteMany({ provider: req.params.id });
    
    // Servis sağlayıcıyı sil
    await provider.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Servis sağlayıcı başarıyla silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Tüm yorumları getir
// @route   GET /api/admin/reviews
// @access  Private/Admin
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate({
        path: 'user',
        select: 'name'
      })
      .populate({
        path: 'provider',
        select: 'companyName'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Randevu durumunu güncelle
// @route   PUT /api/admin/appointments/:id/status
// @access  Private/Admin
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Durum belirtilmedi'
      });
    }
    
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Randevu bulunamadı'
      });
    }
    
    // Bildirim oluştur
    await createNotification({
      recipient: appointment.user,
      sender: req.user.id,
      type: 'appointment_updated',
      title: 'Randevu Durumu Güncellendi',
      message: `Randevunuzun durumu '${status}' olarak güncellendi.`,
      relatedModel: 'Appointment',
      relatedId: appointment._id
    });
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Admin olarak servis sağlayıcı zaman dilimlerini güncelle
// @route   PUT /api/admin/providers/:id/timeslots
// @access  Private/Admin
exports.updateProviderTimeSlots = asyncHandler(async (req, res, next) => {
  const serviceProvider = await ServiceProvider.findById(req.params.id);

  if (!serviceProvider) {
    return next(
      new ErrorResponse(`ID'si ${req.params.id} olan servis sağlayıcı bulunamadı`, 404)
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

// @desc    Admin olarak servis sağlayıcı durumunu (açık/kapalı) güncelle
// @route   PUT /api/admin/providers/:id/status
// @access  Private/Admin
exports.updateProviderStatus = asyncHandler(async (req, res, next) => {
  const serviceProvider = await ServiceProvider.findById(req.params.id);

  if (!serviceProvider) {
    return next(
      new ErrorResponse(`ID'si ${req.params.id} olan servis sağlayıcı bulunamadı`, 404)
    );
  }

  // İsOpen durumunu güncelle
  const updatedServiceProvider = await ServiceProvider.findByIdAndUpdate(
    req.params.id,
    { isOpen: req.body.isOpen },
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