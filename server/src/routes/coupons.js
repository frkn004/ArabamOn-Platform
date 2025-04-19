const express = require('express');
const {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  redeemCoupon
} = require('../controllers/coupons');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Admin rotaları
router.use(protect);

router.route('/')
  .get(authorize('admin'), getCoupons)
  .post(authorize('admin'), createCoupon);

router.route('/:id')
  .get(authorize('admin'), getCoupon)
  .put(authorize('admin'), updateCoupon)
  .delete(authorize('admin'), deleteCoupon);

// Kullanıcı rotaları
router.post('/validate', validateCoupon);
router.post('/redeem', redeemCoupon);

module.exports = router; 