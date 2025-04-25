const express = require('express');
const router = express.Router();
const {
  getProviders,
  getProvider,
  createProvider,
  updateProvider,
  approveProvider,
  getProvidersInRadius,
  getMe,
  updateTimeSlots,
  getTimeSlots,
  updateMapsLink,
  getAvailableTimeSlots,
  toggleProviderStatus
} = require('../controllers/serviceProviders');
const { protect, authorize } = require('../middleware/auth');

// Me rotası
router.route('/me')
  .get(protect, authorize('provider'), getMe);

// Public rotalar
router.route('/')
  .get(getProviders)
  .post(protect, createProvider);

router.route('/:id')
  .get(getProvider)
  .put(protect, authorize('provider', 'admin'), updateProvider);

// Zaman dilimleri rutları
router.route('/:id/timeslots')
  .get(getTimeSlots)
  .put(protect, authorize('provider', 'admin'), updateTimeSlots);

router.route('/:id/maps-link')
  .put(protect, authorize('provider', 'admin'), updateMapsLink);

// Müsait zaman dilimleri
router.route('/:id/available-timeslots/:date')
  .get(getAvailableTimeSlots);

// Admin rotası
router.route('/:id/approve')
  .put(protect, authorize('admin'), approveProvider);

// Konum bazlı arama rotası
router.route('/radius/:lat/:lng/:distance')
  .get(getProvidersInRadius);

// Servis sağlayıcı durumunu (açık/kapalı) değiştirir
router.put('/:id/status', protect, authorize('provider', 'admin'), toggleProviderStatus);

module.exports = router; 