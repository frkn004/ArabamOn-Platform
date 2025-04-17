const express = require('express');
const {
  getBusinesses,
  getBusiness,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  getBusinessesInRadius,
  activateBusiness
} = require('../controllers/businessController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Konum bazlı işletme arama
router.route('/radius/:latitude/:longitude/:distance').get(getBusinessesInRadius);

// İşletme aktivasyon rotası (sadece admin)
router.route('/:id/activate').put(protect, authorize('admin'), activateBusiness);

// Ana işletme rotaları
router
  .route('/')
  .get(getBusinesses)
  .post(protect, authorize('business', 'admin'), createBusiness);

router
  .route('/:id')
  .get(getBusiness)
  .put(protect, authorize('business', 'admin'), updateBusiness)
  .delete(protect, authorize('business', 'admin'), deleteBusiness);

module.exports = router; 
const {
  getBusinesses,
  getBusiness,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  getBusinessesInRadius,
  activateBusiness
} = require('../controllers/businessController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Konum bazlı işletme arama
router.route('/radius/:latitude/:longitude/:distance').get(getBusinessesInRadius);

// İşletme aktivasyon rotası (sadece admin)
router.route('/:id/activate').put(protect, authorize('admin'), activateBusiness);

// Ana işletme rotaları
router
  .route('/')
  .get(getBusinesses)
  .post(protect, authorize('business', 'admin'), createBusiness);

router
  .route('/:id')
  .get(getBusiness)
  .put(protect, authorize('business', 'admin'), updateBusiness)
  .delete(protect, authorize('business', 'admin'), deleteBusiness);

module.exports = router; 