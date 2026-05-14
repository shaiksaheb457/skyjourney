// ============================================================
// controllers/userController.js — User Profile Management
// Handles: get profile, update profile, saved travelers,
//          wishlist, profile picture upload
// ============================================================

const User   = require('../models/User');
const { AppError, catchAsync, sendSuccess } = require('../utils/errorHandler');

// ── Get My Profile ────────────────────────────────────────────
// GET /api/users/profile  (protected)
exports.getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new AppError('User not found', 404));
  sendSuccess(res, 200, 'Profile fetched', { user });
});

// ── Update My Profile ─────────────────────────────────────────
// PUT /api/users/profile  (protected)
// Body: { name, phone, profilePic }
exports.updateProfile = catchAsync(async (req, res, next) => {
  // Only allow these fields to be updated (not password, role, email)
  const { name, phone, profilePic } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, profilePic },
    { new: true, runValidators: true } // return updated doc + run schema validators
  );

  sendSuccess(res, 200, 'Profile updated successfully', { user });
});

// ── Add Saved Traveler ────────────────────────────────────────
// POST /api/users/travelers  (protected)
// Body: { name, age, gender, passportNumber, nationality, dateOfBirth }
exports.addSavedTraveler = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user.savedTravelers.length >= 10) {
    return next(new AppError('You can save a maximum of 10 travelers', 400));
  }

  user.savedTravelers.push(req.body);
  await user.save();

  sendSuccess(res, 201, 'Traveler saved successfully', {
    savedTravelers: user.savedTravelers,
  });
});

// ── Get Saved Travelers ───────────────────────────────────────
// GET /api/users/travelers  (protected)
exports.getSavedTravelers = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('savedTravelers');
  sendSuccess(res, 200, 'Saved travelers fetched', {
    savedTravelers: user.savedTravelers,
  });
});

// ── Delete Saved Traveler ─────────────────────────────────────
// DELETE /api/users/travelers/:travelerId  (protected)
exports.deleteSavedTraveler = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  user.savedTravelers = user.savedTravelers.filter(
    (t) => t._id.toString() !== req.params.travelerId
  );
  await user.save();

  sendSuccess(res, 200, 'Traveler removed', { savedTravelers: user.savedTravelers });
});

// ── Add to Wishlist ───────────────────────────────────────────
// POST /api/users/wishlist  (protected)
// Body: { from, to }
exports.addToWishlist = catchAsync(async (req, res, next) => {
  const { from, to } = req.body;
  const user = await User.findById(req.user._id);

  // Check if route already in wishlist
  const exists = user.wishlist.find((w) => w.from === from && w.to === to);
  if (exists) {
    return next(new AppError('Route already in wishlist', 400));
  }

  user.wishlist.push({ from, to });
  await user.save();

  sendSuccess(res, 201, 'Route added to wishlist', { wishlist: user.wishlist });
});

// ── Remove from Wishlist ──────────────────────────────────────
// DELETE /api/users/wishlist/:routeId  (protected)
exports.removeFromWishlist = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  user.wishlist = user.wishlist.filter(
    (w) => w._id.toString() !== req.params.routeId
  );
  await user.save();

  sendSuccess(res, 200, 'Route removed from wishlist', { wishlist: user.wishlist });
});
