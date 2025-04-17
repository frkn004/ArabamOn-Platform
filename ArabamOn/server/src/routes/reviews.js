const express = require('express');
const router = express.Router();
const {
  getReviews,
  getApprovedReviews,
  getUserReviews,
  getProviderReviews,
  createReview,
  approveReview
} = require('../controllers/reviews');
const { protect, authorize } = require('../middleware/auth');

// Admin rotaları
router.route('/')
  .get(protect, authorize('admin'), getReviews);

router.route('/:id/approve')
  .put(protect, authorize('admin'), approveReview);

// Public rotalar
router.route('/approved')
  .get(getApprovedReviews);

router.route('/provider/:providerId')
  .get(getProviderReviews);

// Kullanıcı rotaları
router.route('/user')
  .get(protect, getUserReviews);

router.route('/')
  .post(protect, createReview);

module.exports = router; 