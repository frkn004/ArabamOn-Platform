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

router.route('/')
  .get(protect, getVehicles)
  .post(protect, createVehicle);

router.route('/:id')
  .get(protect, getVehicle)
  .put(protect, updateVehicle)
  .delete(protect, deleteVehicle);

module.exports = router; 