const express = require('express');
const router = express.Router();
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getProviderServices,
  getServiceTemplates
} = require('../controllers/services');
const { protect, authorize } = require('../middleware/auth');

// Hizmet şablonları
router.route('/templates')
  .get(protect, authorize('provider', 'admin'), getServiceTemplates);

// Public rotalar
router.route('/')
  .get(getServices)
  .post(protect, authorize('provider', 'admin'), createService);

router.route('/:id')
  .get(getService)
  .put(protect, authorize('provider', 'admin'), updateService)
  .delete(protect, authorize('provider', 'admin'), deleteService);

// Hizmet sağlayıcıya göre hizmetleri getir
router.route('/provider/:providerId')
  .get(getProviderServices);

module.exports = router; 