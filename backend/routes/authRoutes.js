// routes/authRoutes.js
const express = require('express');
const router  = express.Router();

const {
  register,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
  changePassword,
  getMe,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register',         register);
router.post('/login',            login);
router.post('/forgot-password',  forgotPassword);
router.post('/verify-otp',       verifyOTP);
router.post('/reset-password',   resetPassword);

// Protected routes
router.get('/me',                protect, getMe);
router.post('/change-password',  protect, changePassword);

module.exports = router;