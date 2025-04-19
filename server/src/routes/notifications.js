const express = require('express');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notifications');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Tüm rotaları yetkilendirme middleware'i ile koru
router.use(protect);

// Bildirim işlemleri
router.get('/', getNotifications);
router.get('/unread/count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

module.exports = router; 