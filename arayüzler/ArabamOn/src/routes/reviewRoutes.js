const express = require('express');
const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  approveReview
} = require('../controllers/reviewController');

const { protect, authorize } = require('../middleware/auth');

// Bu router'ın başka bir router'dan gelen parametreleri alabilmesi için
const router = express.Router({ mergeParams: true });

// Gerkli rotaları korumalı hale getir
router.route('/').post(protect, createReview);
router.route('/:id').put(protect, updateReview).delete(protect, deleteReview);
router.route('/:id/approve').put(protect, authorize('admin'), approveReview);

// Değerlendirmeleri getirme rotaları (public)
router.route('/').get(getReviews);
router.route('/:id').get(getReview);

module.exports = router;
