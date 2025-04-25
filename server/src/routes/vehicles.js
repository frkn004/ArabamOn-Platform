const express = require('express');
const { 
  getVehicles, 
  getVehicle, 
  createVehicle, 
  updateVehicle, 
  deleteVehicle 
} = require('../controllers/vehicles');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Tüm rotaları bir gruba topla ve protect middleware'ini uygula
router.use(protect);

router.route('/')
  .get(getVehicles)
  .post(createVehicle);

router.route('/:id')
  .get(getVehicle)
  .put(updateVehicle)
  .delete(deleteVehicle);

module.exports = router; 