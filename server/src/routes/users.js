const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateProfile,
  addVehicle,
  removeVehicle,
  getMe,
  getVehicles,
  updateVehicle
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
router.route('/me')
  .get(protect, getMe);

router.route('/profile')
  .put(protect, updateProfile);

// Araç rotaları - Kullanıcı modelindeki vehicles üzerinde işlem yapıyor
router.route('/vehicles')
  .get(protect, getVehicles)
  .post(protect, addVehicle);

router.route('/vehicles/:id')
  .delete(protect, removeVehicle)
  .put(protect, updateVehicle);

module.exports = router; 