const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateProfile,
  addVehicle,
  removeVehicle
} = require('../controllers/users');
const { protect, authorize } = require('../middleware/auth');

// Admin rotaları
router
  .route('/')
  .get(protect, authorize('admin'), getUsers);

router
  .route('/:id')
  .get(protect, authorize('admin'), getUser)
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

// Kullanıcı profil rotaları
router.route('/profile')
  .put(protect, updateProfile);

// Araç rotaları
router.route('/vehicles')
  .post(protect, addVehicle);

router.route('/vehicles/:id')
  .delete(protect, removeVehicle);

module.exports = router; 