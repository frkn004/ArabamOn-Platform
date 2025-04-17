const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getCurrentUser, 
  updateUser, 
  deleteUser, 
  getAllUsers,
  updateUserAvatar,
  verifyUserEmail,
  resetPasswordRequest,
  resetPassword,
  getUserById
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Kullanıcı rotaları
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getCurrentUser);
router.put('/me', protect, updateUser);
router.delete('/me', protect, deleteUser);
router.put('/avatar', protect, updateUserAvatar);
router.get('/verify-email/:token', verifyUserEmail);
router.post('/reset-password-request', resetPasswordRequest);
router.post('/reset-password/:token', resetPassword);

// Admin rotaları
router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/:id', protect, authorize('admin'), getUserById);

module.exports = router; 