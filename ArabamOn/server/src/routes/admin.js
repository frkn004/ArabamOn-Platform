const express = require('express');
const {
  getStats,
  getUsers,
  getServiceProviders,
  getAppointments,
  updateProviderApproval,
  createServiceProvider,
  deleteServiceProvider,
  getServices,
  getReviews,
  updateAppointmentStatus
} = require('../controllers/admin');

const { protect, authorize } = require('../middleware/auth');
const serviceController = require('../controllers/services');
const couponController = require('../controllers/coupons');

const router = express.Router();

// Tüm rotaları yetkilendirme middleware'i ile koru
router.use(protect);
router.use(authorize('admin'));

// İstatistikler
router.get('/stats', getStats);

// Kullanıcı yönetimi
router.get('/users', getUsers);

// Servis sağlayıcı yönetimi
router.get('/providers', getServiceProviders);
router.post('/providers', createServiceProvider);
router.put('/providers/:id/approval', updateProviderApproval);
router.delete('/providers/:id', deleteServiceProvider);

// Randevu yönetimi
router.get('/appointments', getAppointments);
router.put('/appointments/:id/status', updateAppointmentStatus);

// Hizmet ve değerlendirme yönetimi
router.get('/services', getServices);
router.get('/reviews', getReviews);
router.get('/services/:id', protect, authorize('admin'), serviceController.getService);
router.put('/services/:id', protect, authorize('admin'), serviceController.updateService);
router.delete('/services/:id', protect, authorize('admin'), serviceController.deleteService);

// Kupon Yönetimi
router.get('/coupons', protect, authorize('admin'), couponController.getCoupons);
router.post('/coupons', protect, authorize('admin'), couponController.createCoupon);
router.delete('/coupons/:id', protect, authorize('admin'), couponController.deleteCoupon);

module.exports = router; 