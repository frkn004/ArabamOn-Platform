const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const ServiceProvider = require('../models/ServiceProvider');
const User = require('../models/User');
const { createNotification, sendAppointmentNotification } = require('./notifications');

// @desc    Tüm randevuları getir
// @route   GET /api/appointments
// @access  Private/Admin
exports.getAppointments = async (req, res) => {
  try {
    let query;
    
    // Admin tüm randevuları görebilir
    if (req.user.role === 'admin') {
      query = Appointment.find();
    }
    // Hizmet sağlayıcı kendi randevularını görebilir
    else if (req.user.role === 'provider') {
      const provider = await ServiceProvider.findOne({ user: req.user.id });
      
      if (!provider) {
        return res.status(404).json({
          success: false,
          message: 'Hizmet sağlayıcı profili bulunamadı'
        });
      }
      
      query = Appointment.find({ provider: provider._id });
    }
    // Normal kullanıcı kendi randevularını görebilir
    else {
      query = Appointment.find({ user: req.user.id });
    }
    
    // Populate işlemleri
    query = query.populate({
      path: 'service',
      select: 'name price duration category'
    }).populate({
      path: 'provider',
      select: 'companyName contactPhone address'
    }).populate({
      path: 'user',
      select: 'name email phone'
    });
    
    const appointments = await query;
    
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

// @desc    Tek randevu getir
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate([
      { path: 'service', select: 'name price duration category' },
      { path: 'provider', select: 'companyName contactPhone address' },
      { path: 'user', select: 'name email phone' }
    ]);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Randevu bulunamadı'
      });
    }
    
    // Erişim kontrolü
    if (
      req.user.role !== 'admin' &&
      appointment.user.toString() !== req.user.id &&
      !(req.user.role === 'provider' && 
        appointment.provider.user && 
        appointment.provider.user.toString() === req.user.id)
    ) {
      return res.status(401).json({
        success: false,
        message: 'Bu randevuyu görüntüleme yetkiniz yok'
      });
    }
    
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

// @desc    Randevu oluştur
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res) => {
  try {
    // Hizmet bilgilerini al
    const service = await Service.findById(req.body.service);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Hizmet bulunamadı'
      });
    }
    
    // Hizmet sağlayıcı bilgilerini kontrol et
    const provider = await ServiceProvider.findById(req.body.provider || service.provider);
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Hizmet sağlayıcı bulunamadı'
      });
    }
    
    // Randevu tarihini kontrol et
    const appointmentDate = new Date(req.body.date);
    const now = new Date();
    
    if (appointmentDate < now) {
      return res.status(400).json({
        success: false,
        message: 'Geçmiş tarihli randevu oluşturamazsınız'
      });
    }
    
    // Seçilen saatin formatını kontrol et (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(req.body.time)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz saat formatı. Lütfen HH:MM formatında girin'
      });
    }
    
    // Tarih ve saati birleştir
    const [hours, minutes] = req.body.time.split(':').map(Number);
    appointmentDate.setHours(hours, minutes, 0, 0);
    
    // Haftanın gününü bul
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[appointmentDate.getDay()];
    
    // Seçilen saatin müsait olup olmadığını kontrol et
    const dayTimeSlots = provider.timeSlots.find(ts => ts.day === dayOfWeek);
    
    if (!dayTimeSlots || !dayTimeSlots.slots) {
      return res.status(400).json({
        success: false,
        message: 'Bu gün için servis sağlayıcının uygun zaman dilimleri bulunmamaktadır'
      });
    }
    
    const selectedTimeSlot = dayTimeSlots.slots.find(slot => slot.time === req.body.time);
    
    if (!selectedTimeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Seçilen saat dilimi mevcut değil'
      });
    }
    
    if (!selectedTimeSlot.available) {
      return res.status(400).json({
        success: false,
        message: 'Seçilen saat dilimi dolu'
      });
    }
    
    // Aynı zaman dilimine başka randevu var mı kontrol et
    const existingAppointment = await Appointment.findOne({
      provider: provider._id,
      date: {
        $gte: new Date(appointmentDate.getTime() - 30 * 60 * 1000), // 30 dakika öncesi
        $lte: new Date(appointmentDate.getTime() + 30 * 60 * 1000)  // 30 dakika sonrası
      },
      status: { $nin: ['iptal edildi'] }
    });
    
    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Bu zaman diliminde başka bir randevu mevcut'
      });
    }
    
    // Kullanıcı ID'sini ekle
    req.body.user = req.user.id;
    
    // Hizmet sağlayıcı ID'sini ekle
    req.body.provider = provider._id;
    
    // Toplam fiyatı ayarla
    req.body.totalPrice = service.price;
    
    // Tarih bilgisini güncelle (saat eklenmiş hali)
    req.body.date = appointmentDate;
    
    const appointment = await Appointment.create(req.body);
    
    // Seçilen zaman dilimini dolu olarak işaretle
    selectedTimeSlot.available = false;
    await provider.save();
    
    // Kullanıcıya bildirim gönder
    await sendAppointmentNotification(
      appointment._id,
      'appointment_created',
      provider.user,
      req.user.id,
      service.name,
      appointmentDate
    );
    
    // Servis sağlayıcıya bildirim gönder
    await createNotification(provider.user, {
      sender: req.user.id,
      type: 'appointment_created',
      title: 'Yeni Randevu Talebi',
      message: `${service.name} hizmeti için yeni bir randevu talebi aldınız.`,
      relatedModel: 'Appointment',
      relatedId: appointment._id
    });
    
    res.status(201).json({
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

// @desc    Randevu durumunu güncelle
// @route   PUT /api/appointments/:id/status
// @access  Private
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['beklemede', 'onaylandı', 'tamamlandı', 'iptal edildi'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir durum belirtmelisiniz'
      });
    }
    
    const appointment = await Appointment.findById(req.params.id).populate('service');
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Randevu bulunamadı'
      });
    }
    
    // Erişim kontrolü
    if (req.user.role === 'user' && appointment.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Bu randevuyu güncelleme yetkiniz yok'
      });
    }
    
    // Hizmet sağlayıcı ise, hizmet sağlayıcı kontrolü yap
    if (req.user.role === 'provider') {
      const provider = await ServiceProvider.findOne({ user: req.user.id });
      
      if (!provider || provider._id.toString() !== appointment.provider.toString()) {
        return res.status(401).json({
          success: false,
          message: 'Bu randevuyu güncelleme yetkiniz yok'
        });
      }
    }
    
    // Eski durumu kaydedelim
    const oldStatus = appointment.status;
    
    // Durumu güncelle
    appointment.status = status;
    await appointment.save();
    
    // Durum değişikliğine göre bildirim gönder
    if (oldStatus !== status) {
      let notificationType;
      switch (status) {
        case 'onaylandı':
          notificationType = 'appointment_confirmed';
          break;
        case 'tamamlandı':
          notificationType = 'appointment_updated';
          break;
        case 'iptal edildi':
          notificationType = 'appointment_cancelled';
          break;
        default:
          notificationType = 'appointment_updated';
      }
      
      // Kullanıcıya bildirim gönder
      await sendAppointmentNotification(
        appointment._id,
        notificationType,
        req.user.id,
        appointment.user,
        appointment.service.name,
        appointment.date
      );
    }
    
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

// @desc    Randevuya değerlendirme ekle
// @route   POST /api/appointments/:id/review
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen 1-5 arası bir puan verin'
      });
    }
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Randevu bulunamadı'
      });
    }
    
    // Sadece randevu sahibi değerlendirme yapabilir
    if (appointment.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Bu randevuya değerlendirme yapma yetkiniz yok'
      });
    }
    
    // Randevu tamamlandı mı kontrol et
    if (appointment.status !== 'tamamlandı') {
      return res.status(400).json({
        success: false,
        message: 'Sadece tamamlanmış randevuları değerlendirebilirsiniz'
      });
    }
    
    // Zaten değerlendirme var mı kontrol et
    if (appointment.review && appointment.review.rating) {
      return res.status(400).json({
        success: false,
        message: 'Bu randevu için zaten bir değerlendirme yapmışsınız'
      });
    }
    
    // Değerlendirmeyi ekle
    appointment.review = {
      rating,
      comment,
      createdAt: Date.now()
    };
    
    await appointment.save();
    
    // Hizmet sağlayıcının ortalama puanını güncelle
    const provider = await ServiceProvider.findById(appointment.provider);
    
    if (provider) {
      // Hizmet sağlayıcının tüm tamamlanmış ve değerlendirilmiş randevularını bul
      const completedAppointments = await Appointment.find({
        provider: provider._id,
        status: 'tamamlandı',
        'review.rating': { $exists: true }
      });
      
      // Ortalama puanı hesapla
      if (completedAppointments.length > 0) {
        const totalRating = completedAppointments.reduce((sum, app) => sum + app.review.rating, 0);
        const averageRating = totalRating / completedAppointments.length;
        
        // Ortalama puanı güncelle
        provider.averageRating = Math.round(averageRating * 10) / 10; // 1 ondalık basamak
        await provider.save();
      }
    }
    
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