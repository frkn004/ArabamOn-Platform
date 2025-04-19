const Notification = require('../models/Notification');
const User = require('../models/User');
const ServiceProvider = require('../models/ServiceProvider');

// @desc    Bildirim oluştur
// @route   N/A (sadece iç işlemler için)
// @access  Private
exports.createNotification = async (recipientId, data) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      sender: data.sender || null,
      type: data.type,
      title: data.title,
      message: data.message,
      relatedModel: data.relatedModel || null,
      relatedId: data.relatedId || null
    });
    
    return notification;
  } catch (error) {
    console.error('Bildirim oluşturma hatası:', error);
    return null;
  }
};

// @desc    Tüm bildirimleri getir (kullanıcı için)
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .populate('sender', 'name');
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Okunmamış bildirim sayısını getir
// @route   GET /api/notifications/unread/count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false
    });
    
    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Bildirimi okundu olarak işaretle
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Bildirim bulunamadı'
      });
    }
    
    // Bildirim bu kullanıcıya ait mi kontrol et
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Bu işlemi yapmaya yetkiniz yok'
      });
    }
    
    notification.isRead = true;
    await notification.save();
    
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Tüm bildirimleri okundu olarak işaretle
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Tüm bildirimler okundu olarak işaretlendi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Bildirimi sil
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Bildirim bulunamadı'
      });
    }
    
    // Bildirim bu kullanıcıya ait mi kontrol et
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Bu işlemi yapmaya yetkiniz yok'
      });
    }
    
    await notification.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Bildirim silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Randevu oluşturulduğunda bildirim gönder
// @route   N/A (iç işlem)
// @access  Private
exports.sendAppointmentNotification = async (
  appointmentId, 
  notificationType, 
  senderId, 
  recipientId, 
  serviceName,
  appointmentDate
) => {
  try {
    const dateStr = new Date(appointmentDate).toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    let title, message;
    
    switch (notificationType) {
      case 'appointment_created':
        title = 'Yeni Randevu Oluşturuldu';
        message = `"${serviceName}" hizmeti için ${dateStr} tarihine randevunuz oluşturuldu. Servis sağlayıcı onayı bekleniyor.`;
        break;
      case 'appointment_confirmed':
        title = 'Randevu Onaylandı';
        message = `"${serviceName}" hizmeti için ${dateStr} tarihindeki randevunuz onaylandı.`;
        break;
      case 'appointment_cancelled':
        title = 'Randevu İptal Edildi';
        message = `"${serviceName}" hizmeti için ${dateStr} tarihindeki randevunuz iptal edildi.`;
        break;
      case 'appointment_updated':
        title = 'Randevu Tamamlandı';
        message = `"${serviceName}" hizmeti için randevunuz tamamlandı. Deneyiminizi değerlendirmek için bir yorum bırakabilirsiniz.`;
        break;
      default:
        title = 'Randevu Güncellendi';
        message = `"${serviceName}" hizmeti için ${dateStr} tarihindeki randevunuzda değişiklik yapıldı.`;
    }
    
    // Bildirimi oluştur
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type: notificationType,
      title: title,
      message: message,
      relatedModel: 'Appointment',
      relatedId: appointmentId
    });
    
    return notification;
  } catch (error) {
    console.error('Randevu bildirimi gönderme hatası:', error);
    return null;
  }
}; 