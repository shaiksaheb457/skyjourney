// ============================================================
// controllers/authController.js — Authentication Logic
// Handles: register, login, logout, forgot/reset password
// ============================================================

const User          = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendOTPEmail } = require('../utils/sendEmail');
const { AppError, catchAsync, sendSuccess } = require('../utils/errorHandler');

// ── Register ──────────────────────────────────────────────────
// POST /api/auth/register
// Body: { name, email, password, phone }
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('An account with this email already exists', 400));
  }

  // Create user — password is auto-hashed by the User model pre-save hook
  const user = await User.create({ name, email, password, phone });

  // Generate JWT token
  const token = generateToken(user._id);

  // Return user data (without password) + token
  sendSuccess(res, 201, 'Account created successfully', {
    token,
    user: {
      _id:   user._id,
      name:  user.name,
      email: user.email,
      phone: user.phone,
      role:  user.role,
    },
  });
});

// ── Login ─────────────────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Find user — include password field (excluded by default with select:false)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Check if account is active
  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Contact support.', 401));
  }

  // Compare entered password with hashed password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Update last login timestamp
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);

  sendSuccess(res, 200, 'Logged in successfully', {
    token,
    user: {
      _id:       user._id,
      name:      user.name,
      email:     user.email,
      phone:     user.phone,
      role:      user.role,
      profilePic: user.profilePic,
    },
  });
});

// ── Get Current User ──────────────────────────────────────────
// GET /api/auth/me  (protected)
exports.getMe = catchAsync(async (req, res, next) => {
  // req.user is set by the protect middleware
  const user = await User.findById(req.user._id);
  sendSuccess(res, 200, 'User fetched', { user });
});

// ── Forgot Password — Send OTP ────────────────────────────────
// POST /api/auth/forgot-password
// Body: { email }
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide your email address', 400));
  }

  const user = await User.findOne({ email });

  // Don't reveal if email exists or not (security)
  if (!user) {
    return sendSuccess(res, 200, 'If that email exists, an OTP has been sent');
  }

  // Generate OTP and save to user document
  const otp = user.generateOTP();
  await user.save({ validateBeforeSave: false });
  console.log(`🔑 OTP for ${user.email} = ${otp}`);

  // Send OTP via email
  try {
    await sendOTPEmail(user.email, otp, user.name);
    sendSuccess(res, 200, 'OTP sent to your email address');
  } catch (err) {
    // If email fails, clear the OTP so user can try again
    user.resetOTP       = null;
    user.resetOTPExpiry = null;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Failed to send OTP email. Please try again.', 500));
  }
});

// ── Verify OTP ────────────────────────────────────────────────
// POST /api/auth/verify-otp
// Body: { email, otp }
exports.verifyOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({
    email,
    resetOTP: otp,
    resetOTPExpiry: { $gt: Date.now() }, // OTP must not be expired
  });

  if (!user) {
    return next(new AppError('Invalid or expired OTP', 400));
  }

  // OTP is valid — generate a short-lived reset token
  const resetToken = generateToken(user._id);

  sendSuccess(res, 200, 'OTP verified successfully', { resetToken });
});

// ── Reset Password ─────────────────────────────────────────────
// POST /api/auth/reset-password
// Body: { email, otp, newPassword }
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({
    email,
    resetOTP: otp,
    resetOTPExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Invalid or expired OTP', 400));
  }

  if (!newPassword || newPassword.length < 6) {
    return next(new AppError('Password must be at least 6 characters', 400));
  }

  // Set new password — pre-save hook will hash it automatically
  user.password       = newPassword;
  user.resetOTP       = null;
  user.resetOTPExpiry = null;
  await user.save();

  sendSuccess(res, 200, 'Password reset successfully. Please log in.');
});

// ── Change Password (logged in) ────────────────────────────────
// POST /api/auth/change-password  (protected)
// Body: { currentPassword, newPassword }
exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return next(new AppError('Current password is incorrect', 401));
  }

  if (newPassword.length < 6) {
    return next(new AppError('New password must be at least 6 characters', 400));
  }

  user.password = newPassword;
  await user.save();

  const token = generateToken(user._id);
  sendSuccess(res, 200, 'Password changed successfully', { token });
});
