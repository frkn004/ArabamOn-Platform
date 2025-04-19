const express = require('express');
const router = express.Router();
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointmentStatus,
  addReview
} = require('../controllers/appointments');
const { protect, authorize } = require('../middleware/auth');

// Randevu rotaları
router.route('/')
  .get(protect, getAppointments)
  .post(protect, createAppointment);

router.route('/:id')
  .get(protect, getAppointment);

router.route('/:id/status')
  .put(protect, updateAppointmentStatus);

router.route('/:id/review')
  .post(protect, addReview);

module.exports = router; 