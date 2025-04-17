const express = require('express');
const router = express.Router();
const { register, login, getMe, logout } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

// Rotaları tanımla
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

module.exports = router; 