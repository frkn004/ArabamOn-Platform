const express = require('express');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');

const { protect, authorize } = require('../middleware/auth');

// Bu router'ın başka bir router'dan gelen parametreleri alabilmesi için
const router = express.Router({ mergeParams: true });

// Ana hizmet rotaları
router
  .route('/')
  .get(getServices)
  .post(protect, authorize('business', 'admin'), createService);

router
  .route('/:id')
  .get(getService)
  .put(protect, authorize('business', 'admin'), updateService)
  .delete(protect, authorize('business', 'admin'), deleteService);

module.exports = router;
