const express = require('express');
const router = express.Router();
const {
  getProviders,
  getProvider,
  createProvider,
  updateProvider,
  approveProvider,
  getProvidersInRadius,
  getMe
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
  .put(protect, updateProvider);

// Admin rotası
router.route('/:id/approve')
  .put(protect, authorize('admin'), approveProvider);

// Konum bazlı arama rotası
router.route('/radius/:lat/:lng/:distance')
  .get(getProvidersInRadius);

module.exports = router; 