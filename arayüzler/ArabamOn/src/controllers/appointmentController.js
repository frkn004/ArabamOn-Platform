const Appointment = require('../models/Appointment');
const Business = require('../models/Business');
const Service = require('../models/Service');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Tüm randevuları getir
 * @route   GET /api/appointments
 * @route   GET /api/businesses/:businessId/appointments
 * @access  Private
 */
exports.getAppointments = async (req, res, next) => {
  try {
    let query;
    
    // Yetki kontrolü
    if (req.user.role === 'user') {
      // Normal kullanıcılar sadece kendi randevularını görebilir
      if (req.params.businessId) {
        query = Appointment.find({
          user: req.user.id,
          business: req.params.businessId
        });
      } else {
        query = Appointment.find({ user: req.user.id });
      }
    } else if (req.user.role === 'business') {
      // İşletme sahipleri sadece kendi işletmelerine ait randevuları görebilir
      const businesses = await Business.find({ owner: req.user.id });
      const businessIds = businesses.map(business => business._id);
      
      if (req.params.businessId) {
        // Eğer belirtilen işletme bu kullanıcıya ait değilse hata ver
        if (!businessIds.includes(req.params.businessId)) {
          return next(new ErrorResponse(`Bu işletmeye ait randevuları görüntüleme yetkiniz yok`, 403));
        }
        
        query = Appointment.find({ business: req.params.businessId });
      } else {
        query = Appointment.find({ business: { $in: businessIds } });
      }
    } else {
      // Admin tüm randevuları görebilir
      if (req.params.businessId) {
        query = Appointment.find({ business: req.params.businessId });
      } else {
        query = Appointment.find();
      }
    }
    
    // İlişkili veriyi getir
    query = query.populate([
      {
        path: 'user',
        select: 'name email phone'
      },
      {
        path: 'business',
        select: 'name type address.city address.district'
      },
      {
        path: 'service',
        select: 'name price duration'
      }
    ]);
    
    // Sıralama
    query = query.sort('-date -time');
    
    // Sayfalama
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Eğer tarih filtresi varsa
    if (req.query.date) {
      const targetDate = new Date(req.query.date);
      query = query.find({
        date: {
          $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          $lt: new Date(targetDate.setHours(23, 59, 59, 999))
        }
      });
    }
    
    // Eğer durum filtresi varsa
    if (req.query.status) {
      query = query.find({ status: req.query.status });
    }
    
    const total = await Appointment.countDocuments(query);
    
    query = query.skip(startIndex).limit(limit);
    
    // Sorguyu çalıştır
    const appointments = await query;
    
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
      count: appointments.length,
      pagination,
      data: appointments
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Tek bir randevu getir
 * @route   GET /api/appointments/:id
 * @access  Private
 */
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name email phone'
      })
      .populate({
        path: 'business',
        select: 'name type address workingHours'
      })
      .populate({
        path: 'service',
        select: 'name price duration'
      });
    
    if (!appointment) {
      return next(new ErrorResponse(`${req.params.id} ID'li randevu bulunamadı`, 404));
    }
    
    // Yetki kontrolü - kullanıcı kendi randevusunu, işletme kendi işletmesine ait randevuyu görebilir
    if (
      req.user.role === 'user' && appointment.user.toString() !== req.user.id ||
      req.user.role === 'business'
    ) {
      const business = await Business.findById(appointment.business);
      if (!business || business.owner.toString() !== req.user.id) {
        return next(new ErrorResponse(`Bu randevuyu görüntüleme yetkiniz yok`, 403));
      }
    }
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Yeni randevu oluştur
 * @route   POST /api/businesses/:businessId/appointments
 * @access  Private (User)
 */
exports.createAppointment = async (req, res, next) => {
  try {
    // Form verilerine kullanıcı ve işletme ID'sini ekle
    req.body.user = req.user.id;
    req.body.business = req.params.businessId;
    
    // İşletmeyi kontrol et
    const business = await Business.findById(req.params.businessId);
    
    if (!business) {
      return next(new ErrorResponse(`${req.params.businessId} ID'li işletme bulunamadı`, 404));
    }
    
    if (!business.isActive) {
      return next(new ErrorResponse(`Bu işletme şu anda randevu almaya kapalı`, 400));
    }
    
    // Hizmeti kontrol et
    const service = await Service.findById(req.body.service);
    
    if (!service) {
      return next(new ErrorResponse(`${req.body.service} ID'li hizmet bulunamadı`, 404));
    }
    
    if (!service.isActive) {
      return next(new ErrorResponse(`Bu hizmet şu anda mevcut değil`, 400));
    }
    
    // Hizmetin bu işletmeye ait olduğunu kontrol et
    if (service.business.toString() !== req.params.businessId) {
      return next(new ErrorResponse(`Bu hizmet seçilen işletmeye ait değil`, 400));
    }
    
    // Randevu tarihinin gelecekte olduğunu kontrol et
    const appointmentDateTime = new Date(req.body.date);
    const [hours, minutes] = req.body.time.split(':').map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);
    
    if (appointmentDateTime < new Date()) {
      return next(new ErrorResponse(`Randevu tarihi geçmiş bir tarih olamaz`, 400));
    }
    
    // Çalışma saatlerini kontrol et
    const dayOfWeek = appointmentDateTime.toLocaleString('tr-TR', { weekday: 'long' }).toLowerCase();
    const workingHours = business.workingHours.find(wh => wh.day === dayOfWeek);
    
    if (!workingHours || !workingHours.isOpen) {
      return next(new ErrorResponse(`İşletme bu gün kapalı`, 400));
    }
    
    const [openHours, openMinutes] = workingHours.openTime.split(':').map(Number);
    const [closeHours, closeMinutes] = workingHours.closeTime.split(':').map(Number);
    const openTime = new Date(appointmentDateTime);
    openTime.setHours(openHours, openMinutes, 0, 0);
    const closeTime = new Date(appointmentDateTime);
    closeTime.setHours(closeHours, closeMinutes, 0, 0);
    
    if (appointmentDateTime < openTime || appointmentDateTime > closeTime) {
      return next(new ErrorResponse(`Seçilen saat işletme çalışma saatleri dışında`, 400));
    }
    
    // Randevu oluştur
    const appointment = await Appointment.create(req.body);
    
    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Randevu güncelle
 * @route   PUT /api/appointments/:id
 * @access  Private
 */
exports.updateAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return next(new ErrorResponse(`${req.params.id} ID'li randevu bulunamadı`, 404));
    }
    
    // Yetki kontrolü
    if (req.user.role === 'user') {
      // Kullanıcı sadece kendi randevusunu değiştirebilir ve sadece belirli alanlar değiştirilebilir
      if (appointment.user.toString() !== req.user.id) {
        return next(new ErrorResponse(`Bu randevuyu güncelleme yetkiniz yok`, 403));
      }
      
      // Kullanıcılar sadece notları güncelleyebilir veya iptal edebilir
      const allowedFields = ['notes', 'status'];
      const requestedUpdates = Object.keys(req.body);
      
      const isValidOperation = requestedUpdates.every(update => allowedFields.includes(update));
      
      if (!isValidOperation) {
        return next(new ErrorResponse(`Sadece notları güncelleyebilir veya randevuyu iptal edebilirsiniz`, 400));
      }
      
      // Kullanıcılar sadece beklemede veya onaylanmış randevuları iptal edebilir
      if (req.body.status && req.body.status === 'iptal edildi') {
        if (!['beklemede', 'onaylandı'].includes(appointment.status)) {
          return next(new ErrorResponse(`Sadece beklemede veya onaylanmış randevuları iptal edebilirsiniz`, 400));
        }
      } else if (req.body.status) {
        return next(new ErrorResponse(`Randevu durumunu değiştirme yetkiniz yok`, 403));
      }
    } else if (req.user.role === 'business') {
      // İşletme sahibi sadece kendi işletmesine ait randevuları değiştirebilir
      const business = await Business.findById(appointment.business);
      
      if (!business || business.owner.toString() !== req.user.id) {
        return next(new ErrorResponse(`Bu randevuyu güncelleme yetkiniz yok`, 403));
      }
      
      // İşletmeler sadece randevu durumunu değiştirebilir
      const allowedFields = ['status', 'notes'];
      const requestedUpdates = Object.keys(req.body);
      
      const isValidOperation = requestedUpdates.every(update => allowedFields.includes(update));
      
      if (!isValidOperation) {
        return next(new ErrorResponse(`Sadece randevu durumunu ve notları değiştirebilirsiniz`, 400));
      }
    }
    
    // Randevu güncelle
    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Randevu iptal et
 * @route   DELETE /api/appointments/:id
 * @access  Private
 */
exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return next(new ErrorResponse(`${req.params.id} ID'li randevu bulunamadı`, 404));
    }
    
    // Yetki kontrolü
    if (req.user.role === 'user') {
      // Kullanıcı sadece kendi randevusunu iptal edebilir
      if (appointment.user.toString() !== req.user.id) {
        return next(new ErrorResponse(`Bu randevuyu iptal etme yetkiniz yok`, 403));
      }
      
      // Kullanıcılar sadece beklemede veya onaylanmış randevuları iptal edebilir
      if (!['beklemede', 'onaylandı'].includes(appointment.status)) {
        return next(new ErrorResponse(`Sadece beklemede veya onaylanmış randevuları iptal edebilirsiniz`, 400));
      }
    } else if (req.user.role === 'business') {
      // İşletme sahibi sadece kendi işletmesine ait randevuları iptal edebilir
      const business = await Business.findById(appointment.business);
      
      if (!business || business.owner.toString() !== req.user.id) {
        return next(new ErrorResponse(`Bu randevuyu iptal etme yetkiniz yok`, 403));
      }
    }
    
    // Randevuyu iptal et (gerçekten silme, sadece durumunu değiştir)
    appointment.status = 'iptal edildi';
    appointment.cancelReason = req.body.cancelReason || 'Kullanıcı tarafından iptal edildi';
    await appointment.save();
    
    res.status(200).json({
      success: true,
      data: {},
      message: 'Randevu iptal edildi'
    });
  } catch (err) {
    next(err);
  }
}; 
const Business = require('../models/Business');
const Service = require('../models/Service');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Tüm randevuları getir
 * @route   GET /api/appointments
 * @route   GET /api/businesses/:businessId/appointments
 * @access  Private
 */
exports.getAppointments = async (req, res, next) => {
  try {
    let query;
    
    // Yetki kontrolü
    if (req.user.role === 'user') {
      // Normal kullanıcılar sadece kendi randevularını görebilir
      if (req.params.businessId) {
        query = Appointment.find({
          user: req.user.id,
          business: req.params.businessId
        });
      } else {
        query = Appointment.find({ user: req.user.id });
      }
    } else if (req.user.role === 'business') {
      // İşletme sahipleri sadece kendi işletmelerine ait randevuları görebilir
      const businesses = await Business.find({ owner: req.user.id });
      const businessIds = businesses.map(business => business._id);
      
      if (req.params.businessId) {
        // Eğer belirtilen işletme bu kullanıcıya ait değilse hata ver
        if (!businessIds.includes(req.params.businessId)) {
          return next(new ErrorResponse(`Bu işletmeye ait randevuları görüntüleme yetkiniz yok`, 403));
        }
        
        query = Appointment.find({ business: req.params.businessId });
      } else {
        query = Appointment.find({ business: { $in: businessIds } });
      }
    } else {
      // Admin tüm randevuları görebilir
      if (req.params.businessId) {
        query = Appointment.find({ business: req.params.businessId });
      } else {
        query = Appointment.find();
      }
    }
    
    // İlişkili veriyi getir
    query = query.populate([
      {
        path: 'user',
        select: 'name email phone'
      },
      {
        path: 'business',
        select: 'name type address.city address.district'
      },
      {
        path: 'service',
        select: 'name price duration'
      }
    ]);
    
    // Sıralama
    query = query.sort('-date -time');
    
    // Sayfalama
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Eğer tarih filtresi varsa
    if (req.query.date) {
      const targetDate = new Date(req.query.date);
      query = query.find({
        date: {
          $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          $lt: new Date(targetDate.setHours(23, 59, 59, 999))
        }
      });
    }
    
    // Eğer durum filtresi varsa
    if (req.query.status) {
      query = query.find({ status: req.query.status });
    }
    
    const total = await Appointment.countDocuments(query);
    
    query = query.skip(startIndex).limit(limit);
    
    // Sorguyu çalıştır
    const appointments = await query;
    
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
      count: appointments.length,
      pagination,
      data: appointments
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Tek bir randevu getir
 * @route   GET /api/appointments/:id
 * @access  Private
 */
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name email phone'
      })
      .populate({
        path: 'business',
        select: 'name type address workingHours'
      })
      .populate({
        path: 'service',
        select: 'name price duration'
      });
    
    if (!appointment) {
      return next(new ErrorResponse(`${req.params.id} ID'li randevu bulunamadı`, 404));
    }
    
    // Yetki kontrolü - kullanıcı kendi randevusunu, işletme kendi işletmesine ait randevuyu görebilir
    if (
      req.user.role === 'user' && appointment.user.toString() !== req.user.id ||
      req.user.role === 'business'
    ) {
      const business = await Business.findById(appointment.business);
      if (!business || business.owner.toString() !== req.user.id) {
        return next(new ErrorResponse(`Bu randevuyu görüntüleme yetkiniz yok`, 403));
      }
    }
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Yeni randevu oluştur
 * @route   POST /api/businesses/:businessId/appointments
 * @access  Private (User)
 */
exports.createAppointment = async (req, res, next) => {
  try {
    // Form verilerine kullanıcı ve işletme ID'sini ekle
    req.body.user = req.user.id;
    req.body.business = req.params.businessId;
    
    // İşletmeyi kontrol et
    const business = await Business.findById(req.params.businessId);
    
    if (!business) {
      return next(new ErrorResponse(`${req.params.businessId} ID'li işletme bulunamadı`, 404));
    }
    
    if (!business.isActive) {
      return next(new ErrorResponse(`Bu işletme şu anda randevu almaya kapalı`, 400));
    }
    
    // Hizmeti kontrol et
    const service = await Service.findById(req.body.service);
    
    if (!service) {
      return next(new ErrorResponse(`${req.body.service} ID'li hizmet bulunamadı`, 404));
    }
    
    if (!service.isActive) {
      return next(new ErrorResponse(`Bu hizmet şu anda mevcut değil`, 400));
    }
    
    // Hizmetin bu işletmeye ait olduğunu kontrol et
    if (service.business.toString() !== req.params.businessId) {
      return next(new ErrorResponse(`Bu hizmet seçilen işletmeye ait değil`, 400));
    }
    
    // Randevu tarihinin gelecekte olduğunu kontrol et
    const appointmentDateTime = new Date(req.body.date);
    const [hours, minutes] = req.body.time.split(':').map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);
    
    if (appointmentDateTime < new Date()) {
      return next(new ErrorResponse(`Randevu tarihi geçmiş bir tarih olamaz`, 400));
    }
    
    // Çalışma saatlerini kontrol et
    const dayOfWeek = appointmentDateTime.toLocaleString('tr-TR', { weekday: 'long' }).toLowerCase();
    const workingHours = business.workingHours.find(wh => wh.day === dayOfWeek);
    
    if (!workingHours || !workingHours.isOpen) {
      return next(new ErrorResponse(`İşletme bu gün kapalı`, 400));
    }
    
    const [openHours, openMinutes] = workingHours.openTime.split(':').map(Number);
    const [closeHours, closeMinutes] = workingHours.closeTime.split(':').map(Number);
    const openTime = new Date(appointmentDateTime);
    openTime.setHours(openHours, openMinutes, 0, 0);
    const closeTime = new Date(appointmentDateTime);
    closeTime.setHours(closeHours, closeMinutes, 0, 0);
    
    if (appointmentDateTime < openTime || appointmentDateTime > closeTime) {
      return next(new ErrorResponse(`Seçilen saat işletme çalışma saatleri dışında`, 400));
    }
    
    // Randevu oluştur
    const appointment = await Appointment.create(req.body);
    
    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Randevu güncelle
 * @route   PUT /api/appointments/:id
 * @access  Private
 */
exports.updateAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return next(new ErrorResponse(`${req.params.id} ID'li randevu bulunamadı`, 404));
    }
    
    // Yetki kontrolü
    if (req.user.role === 'user') {
      // Kullanıcı sadece kendi randevusunu değiştirebilir ve sadece belirli alanlar değiştirilebilir
      if (appointment.user.toString() !== req.user.id) {
        return next(new ErrorResponse(`Bu randevuyu güncelleme yetkiniz yok`, 403));
      }
      
      // Kullanıcılar sadece notları güncelleyebilir veya iptal edebilir
      const allowedFields = ['notes', 'status'];
      const requestedUpdates = Object.keys(req.body);
      
      const isValidOperation = requestedUpdates.every(update => allowedFields.includes(update));
      
      if (!isValidOperation) {
        return next(new ErrorResponse(`Sadece notları güncelleyebilir veya randevuyu iptal edebilirsiniz`, 400));
      }
      
      // Kullanıcılar sadece beklemede veya onaylanmış randevuları iptal edebilir
      if (req.body.status && req.body.status === 'iptal edildi') {
        if (!['beklemede', 'onaylandı'].includes(appointment.status)) {
          return next(new ErrorResponse(`Sadece beklemede veya onaylanmış randevuları iptal edebilirsiniz`, 400));
        }
      } else if (req.body.status) {
        return next(new ErrorResponse(`Randevu durumunu değiştirme yetkiniz yok`, 403));
      }
    } else if (req.user.role === 'business') {
      // İşletme sahibi sadece kendi işletmesine ait randevuları değiştirebilir
      const business = await Business.findById(appointment.business);
      
      if (!business || business.owner.toString() !== req.user.id) {
        return next(new ErrorResponse(`Bu randevuyu güncelleme yetkiniz yok`, 403));
      }
      
      // İşletmeler sadece randevu durumunu değiştirebilir
      const allowedFields = ['status', 'notes'];
      const requestedUpdates = Object.keys(req.body);
      
      const isValidOperation = requestedUpdates.every(update => allowedFields.includes(update));
      
      if (!isValidOperation) {
        return next(new ErrorResponse(`Sadece randevu durumunu ve notları değiştirebilirsiniz`, 400));
      }
    }
    
    // Randevu güncelle
    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Randevu iptal et
 * @route   DELETE /api/appointments/:id
 * @access  Private
 */
exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return next(new ErrorResponse(`${req.params.id} ID'li randevu bulunamadı`, 404));
    }
    
    // Yetki kontrolü
    if (req.user.role === 'user') {
      // Kullanıcı sadece kendi randevusunu iptal edebilir
      if (appointment.user.toString() !== req.user.id) {
        return next(new ErrorResponse(`Bu randevuyu iptal etme yetkiniz yok`, 403));
      }
      
      // Kullanıcılar sadece beklemede veya onaylanmış randevuları iptal edebilir
      if (!['beklemede', 'onaylandı'].includes(appointment.status)) {
        return next(new ErrorResponse(`Sadece beklemede veya onaylanmış randevuları iptal edebilirsiniz`, 400));
      }
    } else if (req.user.role === 'business') {
      // İşletme sahibi sadece kendi işletmesine ait randevuları iptal edebilir
      const business = await Business.findById(appointment.business);
      
      if (!business || business.owner.toString() !== req.user.id) {
        return next(new ErrorResponse(`Bu randevuyu iptal etme yetkiniz yok`, 403));
      }
    }
    
    // Randevuyu iptal et (gerçekten silme, sadece durumunu değiştir)
    appointment.status = 'iptal edildi';
    appointment.cancelReason = req.body.cancelReason || 'Kullanıcı tarafından iptal edildi';
    await appointment.save();
    
    res.status(200).json({
      success: true,
      data: {},
      message: 'Randevu iptal edildi'
    });
  } catch (err) {
    next(err);
  }
}; 