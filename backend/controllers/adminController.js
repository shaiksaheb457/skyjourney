// ============================================================
// controllers/adminController.js — Admin Panel Logic
// All routes here are protected with: protect + restrictTo('admin')
// Handles: flight CRUD, manage users, view all bookings, revenue
// ============================================================

const Flight   = require('../models/Flight');
const Booking  = require('../models/Booking');
const User     = require('../models/User');
const Payment  = require('../models/Payment');
const Coupon   = require('../models/Coupon');
const { AppError, catchAsync, sendSuccess } = require('../utils/errorHandler');

// ══════════════════════════════════════════════════════════════
// FLIGHT MANAGEMENT
// ══════════════════════════════════════════════════════════════

// ── Get All Flights (Admin) ───────────────────────────────────
// GET /api/admin/flights
exports.getAllFlights = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, search, status, airline } = req.query;

  const query = {};
  if (status)  query.status  = status;
  if (airline) query.airline = new RegExp(airline, 'i');
  if (search) {
    query.$or = [
      { flightNumber: new RegExp(search, 'i') },
      { 'from.city':  new RegExp(search, 'i') },
      { 'to.city':    new RegExp(search, 'i') },
    ];
  }

  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await Flight.countDocuments(query);

  const flights = await Flight.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  sendSuccess(res, 200, 'Flights fetched', {
    flights, total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
  });
});

// ── Create Flight ─────────────────────────────────────────────
// POST /api/admin/flights
exports.createFlight = catchAsync(async (req, res, next) => {
  // Calculate duration automatically from departure and arrival times
  if (req.body.departureTime && req.body.arrivalTime) {
    const dep = new Date(req.body.departureTime);
    const arr = new Date(req.body.arrivalTime);
    req.body.duration = Math.round((arr - dep) / (1000 * 60)); // in minutes
  }

  const flight = await Flight.create(req.body);
  sendSuccess(res, 201, 'Flight created successfully', { flight });
});

// ── Update Flight ─────────────────────────────────────────────
// PUT /api/admin/flights/:id
exports.updateFlight = catchAsync(async (req, res, next) => {
  // Recalculate duration if times changed
  if (req.body.departureTime && req.body.arrivalTime) {
    const dep = new Date(req.body.departureTime);
    const arr = new Date(req.body.arrivalTime);
    req.body.duration = Math.round((arr - dep) / (1000 * 60));
  }

  const flight = await Flight.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!flight) return next(new AppError('Flight not found', 404));

  sendSuccess(res, 200, 'Flight updated successfully', { flight });
});

// ── Delete Flight ─────────────────────────────────────────────
// DELETE /api/admin/flights/:id
exports.deleteFlight = catchAsync(async (req, res, next) => {
  const flight = await Flight.findById(req.params.id);
  if (!flight) return next(new AppError('Flight not found', 404));

  // Check if any confirmed bookings exist for this flight
  const activeBookings = await Booking.countDocuments({
    flightId: req.params.id,
    status: { $in: ['pending', 'confirmed'] },
  });

  if (activeBookings > 0) {
    return next(
      new AppError(`Cannot delete flight with ${activeBookings} active booking(s)`, 400)
    );
  }

  await Flight.findByIdAndDelete(req.params.id);
  sendSuccess(res, 200, 'Flight deleted successfully');
});

// ── Update Flight Status ──────────────────────────────────────
// PATCH /api/admin/flights/:id/status
// Body: { status, delayMinutes }
exports.updateFlightStatus = catchAsync(async (req, res, next) => {
  const { status, delayMinutes } = req.body;

  const flight = await Flight.findByIdAndUpdate(
    req.params.id,
    { status, delayMinutes: delayMinutes || 0 },
    { new: true }
  );

  if (!flight) return next(new AppError('Flight not found', 404));

  sendSuccess(res, 200, 'Flight status updated', { flight });
});

// ══════════════════════════════════════════════════════════════
// USER MANAGEMENT
// ══════════════════════════════════════════════════════════════

// ── Get All Users ─────────────────────────────────────────────
// GET /api/admin/users
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, search, role } = req.query;

  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name:  new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
  }

  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(query);

  const users = await User.find(query)
    .select('-password -resetOTP -resetOTPExpiry')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  sendSuccess(res, 200, 'Users fetched', {
    users, total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
  });
});

// ── Toggle User Active Status ─────────────────────────────────
// PATCH /api/admin/users/:id/toggle-status
exports.toggleUserStatus = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found', 404));

  if (user.role === 'admin') {
    return next(new AppError('Cannot deactivate an admin account', 400));
  }

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  sendSuccess(res, 200, `User ${user.isActive ? 'activated' : 'deactivated'}`, {
    user: { _id: user._id, name: user.name, isActive: user.isActive },
  });
});

// ══════════════════════════════════════════════════════════════
// BOOKING MANAGEMENT
// ══════════════════════════════════════════════════════════════

// ── Get All Bookings (Admin) ──────────────────────────────────
// GET /api/admin/bookings
exports.getAllBookings = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, status, search } = req.query;

  const query = {};
  if (status) query.status = status;

  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await Booking.countDocuments(query);

  const bookings = await Booking.find(query)
    .populate('userId',   'name email phone')
    .populate('flightId', 'airline flightNumber from to departureTime')
    .populate('paymentId','amount status gateway transactionId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  sendSuccess(res, 200, 'Bookings fetched', {
    bookings, total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
  });
});

// ══════════════════════════════════════════════════════════════
// ANALYTICS & REVENUE
// ══════════════════════════════════════════════════════════════

// ── Revenue Dashboard ─────────────────────────────────────────
// GET /api/admin/revenue
exports.getRevenueDashboard = catchAsync(async (req, res, next) => {
  const { period = '30' } = req.query; // days
  const daysAgo = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

  // ── Overall Stats ────────────────────────────────────────────
  const [
    totalUsers,
    totalFlights,
    totalBookings,
    confirmedBookings,
    cancelledBookings,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Flight.countDocuments(),
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'confirmed' }),
    Booking.countDocuments({ status: 'cancelled' }),
  ]);

  // ── Total Revenue ────────────────────────────────────────────
  const revenueData = await Payment.aggregate([
    { $match: { status: 'captured' } },
    { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
  ]);
  const totalRevenue = revenueData[0]?.totalRevenue || 0;

  // ── Revenue Per Day (last N days) ─────────────────────────────
  const dailyRevenue = await Payment.aggregate([
    {
      $match: {
        status: 'captured',
        createdAt: { $gte: daysAgo },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        revenue:  { $sum: '$amount' },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // ── Bookings Per Day ──────────────────────────────────────────
  const dailyBookings = await Booking.aggregate([
    { $match: { createdAt: { $gte: daysAgo } } },
    {
      $group: {
        _id:   { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // ── Top Airlines by Bookings ──────────────────────────────────
  const topAirlines = await Booking.aggregate([
    { $match: { status: 'confirmed' } },
    { $lookup: { from: 'flights', localField: 'flightId', foreignField: '_id', as: 'flight' } },
    { $unwind: '$flight' },
    { $group: { _id: '$flight.airline', bookings: { $sum: 1 } } },
    { $sort: { bookings: -1 } },
    { $limit: 5 },
  ]);

  // ── Top Routes ────────────────────────────────────────────────
  const topRoutes = await Booking.aggregate([
    { $match: { status: 'confirmed' } },
    { $lookup: { from: 'flights', localField: 'flightId', foreignField: '_id', as: 'flight' } },
    { $unwind: '$flight' },
    {
      $group: {
        _id:      { from: '$flight.from.city', to: '$flight.to.city' },
        bookings: { $sum: 1 },
        revenue:  { $sum: '$pricing.totalAmount' },
      },
    },
    { $sort: { bookings: -1 } },
    { $limit: 5 },
  ]);

  // ── New Users Per Day ─────────────────────────────────────────
  const newUsers = await User.aggregate([
    { $match: { createdAt: { $gte: daysAgo }, role: 'user' } },
    {
      $group: {
        _id:   { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  sendSuccess(res, 200, 'Revenue dashboard data fetched', {
    overview: {
      totalUsers,
      totalFlights,
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalRevenue,
    },
    charts: {
      dailyRevenue,
      dailyBookings,
      newUsers,
    },
    topAirlines,
    topRoutes,
  });
});

// ══════════════════════════════════════════════════════════════
// COUPON MANAGEMENT
// ══════════════════════════════════════════════════════════════

// ── Create Coupon ─────────────────────────────────────────────
// POST /api/admin/coupons
exports.createCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.create(req.body);
  sendSuccess(res, 201, 'Coupon created', { coupon });
});

// ── Get All Coupons ───────────────────────────────────────────
// GET /api/admin/coupons
exports.getAllCoupons = catchAsync(async (req, res, next) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  sendSuccess(res, 200, 'Coupons fetched', { coupons });
});

// ── Toggle Coupon Status ──────────────────────────────────────
// PATCH /api/admin/coupons/:id/toggle
exports.toggleCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return next(new AppError('Coupon not found', 404));

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  sendSuccess(res, 200, `Coupon ${coupon.isActive ? 'activated' : 'deactivated'}`, { coupon });
});

// ── Delete Coupon ─────────────────────────────────────────────
// DELETE /api/admin/coupons/:id
exports.deleteCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return next(new AppError('Coupon not found', 404));
  sendSuccess(res, 200, 'Coupon deleted');
});
