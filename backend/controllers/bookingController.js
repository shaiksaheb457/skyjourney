// ============================================================
// controllers/bookingController.js — Booking Management
// Handles: create booking, get bookings, cancel, coupon apply
// ============================================================

const Booking      = require('../models/Booking');
const Flight       = require('../models/Flight');
const Coupon       = require('../models/Coupon');
const Notification = require('../models/Notification');
const { AppError, catchAsync, sendSuccess } = require('../utils/errorHandler');

// ── Create Booking ────────────────────────────────────────────
// POST /api/bookings/create  (protected)
// Body: { flightId, passengers[], cabinClass, addOns, gstDetails, couponCode }
exports.createBooking = catchAsync(async (req, res, next) => {
  const {
    flightId,
    passengers,
    cabinClass    = 'economy',
    addOns,
    gstDetails,
    couponCode,
    tripType      = 'one-way',
    returnFlightId,
  } = req.body;

  // ── Validate Flight ──────────────────────────────────────────
  const flight = await Flight.findById(flightId);
  if (!flight) return next(new AppError('Flight not found', 404));
  if (flight.status !== 'scheduled') {
    return next(new AppError(`This flight is ${flight.status} and cannot be booked`, 400));
  }

  const numPassengers = passengers.length;

  // ── Check Seat Availability ──────────────────────────────────
  const availableSeats = flight.seats[cabinClass]?.available || 0;
  if (availableSeats < numPassengers) {
    return next(
      new AppError(`Only ${availableSeats} seat(s) available in ${cabinClass}`, 400)
    );
  }

  // ── Calculate Pricing ────────────────────────────────────────
  const pricePerSeat = flight.price[cabinClass] || 0;
  const baseFare     = pricePerSeat * numPassengers;
  const taxRate      = 0.05; // 5% GST on airfare
  const taxes        = Math.round(baseFare * taxRate);

  // Calculate add-ons fee
  let addOnsFee = 0;
  if (addOns?.extraBaggage?.weight > 0) addOnsFee += addOns.extraBaggage.price || 0;
  if (addOns?.travelInsurance?.enabled) addOnsFee += addOns.travelInsurance.price || 299;
  if (addOns?.priorityBoarding?.enabled) addOnsFee += addOns.priorityBoarding.price || 199;

  // ── Apply Coupon ─────────────────────────────────────────────
  let discount   = 0;
  let couponData = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

    if (!coupon) {
      return next(new AppError('Invalid coupon code', 400));
    }

    const subtotal         = baseFare + taxes + addOnsFee;
    const { valid, message } = coupon.isValidForUser(req.user._id, subtotal);

    if (!valid) return next(new AppError(message, 400));

    discount   = coupon.calculateDiscount(subtotal);
    couponData = { code: coupon.code, discount };
  }

  const totalAmount = baseFare + taxes + addOnsFee - discount;

  // ── Create Booking ───────────────────────────────────────────
  const booking = await Booking.create({
    userId:     req.user._id,
    flightId,
    returnFlightId,
    tripType,
    passengers,
    cabinClass,
    addOns,
    gstDetails,
    couponCode: couponData?.code,
    couponDiscount: discount,
    pricing: {
      baseFare,
      taxes,
      addOnsFee,
      discount,
      totalAmount,
    },
    status: 'pending', // becomes 'confirmed' after payment
  });

  // ── Reserve Seats ────────────────────────────────────────────
  // Temporarily reduce available seats while payment is pending
  await Flight.findByIdAndUpdate(flightId, {
    $inc: { [`seats.${cabinClass}.available`]: -numPassengers },
  });

  // ── Update Coupon Usage ──────────────────────────────────────
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    coupon.usedCount += 1;
    const userUsage = coupon.usedBy.find(
      (u) => u.userId.toString() === req.user._id.toString()
    );
    if (userUsage) {
      userUsage.usedCount += 1;
    } else {
      coupon.usedBy.push({ userId: req.user._id, usedCount: 1 });
    }
    await coupon.save();
  }

  // Populate flight details in response
  const populatedBooking = await Booking.findById(booking._id)
    .populate('flightId', 'airline flightNumber from to departureTime arrivalTime duration')
    .populate('userId', 'name email');

  sendSuccess(res, 201, 'Booking created. Proceed to payment.', {
    booking: populatedBooking,
  });
});

// ── Get My Bookings ───────────────────────────────────────────
// GET /api/bookings/my  (protected)
exports.getMyBookings = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = { userId: req.user._id };
  if (status) query.status = status;

  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await Booking.countDocuments(query);

  const bookings = await Booking.find(query)
    .populate('flightId', 'airline airlineLogo flightNumber from to departureTime arrivalTime duration stops')
    .sort({ createdAt: -1 }) // newest first
    .skip(skip)
    .limit(parseInt(limit));

  sendSuccess(res, 200, 'Bookings fetched', {
    bookings,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
  });
});

// ── Get Single Booking ────────────────────────────────────────
// GET /api/bookings/:id  (protected)
exports.getBookingById = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('flightId')
    .populate('userId', 'name email phone')
    .populate('paymentId');

  if (!booking) return next(new AppError('Booking not found', 404));

  // Users can only see their own bookings (admins can see all)
  if (
    booking.userId._id.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return next(new AppError('You are not authorized to view this booking', 403));
  }

  sendSuccess(res, 200, 'Booking fetched', { booking });
});

// ── Cancel Booking ────────────────────────────────────────────
// POST /api/bookings/:id/cancel  (protected)
// Body: { reason }
exports.cancelBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id).populate('flightId');

  if (!booking) return next(new AppError('Booking not found', 404));

  if (booking.userId.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to cancel this booking', 403));
  }

  if (booking.status === 'cancelled') {
    return next(new AppError('Booking is already cancelled', 400));
  }

  if (booking.status === 'completed') {
    return next(new AppError('Cannot cancel a completed booking', 400));
  }

  // ── Calculate Refund ─────────────────────────────────────────
  const hoursUntilFlight = (new Date(booking.flightId.departureTime) - new Date()) / (1000 * 60 * 60);
  let refundAmount = 0;

  if (hoursUntilFlight > 24) {
    // More than 24 hours before flight → full refund minus cancellation charge
    const cancellationCharge = booking.flightId.cancellationCharge || 500;
    refundAmount = Math.max(booking.pricing.totalAmount - cancellationCharge, 0);
  } else if (hoursUntilFlight > 4) {
    // 4–24 hours → 50% refund
    refundAmount = Math.round(booking.pricing.totalAmount * 0.5);
  } else {
    // Less than 4 hours → no refund
    refundAmount = 0;
  }

  // ── Update Booking ────────────────────────────────────────────
  booking.status             = 'cancelled';
  booking.cancelledAt        = new Date();
  booking.cancellationReason = req.body.reason || 'Cancelled by user';
  booking.refundAmount       = refundAmount;
  booking.refundStatus       = refundAmount > 0 ? 'pending' : 'none';
  await booking.save();

  // ── Restore Seats ─────────────────────────────────────────────
  await Flight.findByIdAndUpdate(booking.flightId._id, {
    $inc: {
      [`seats.${booking.cabinClass}.available`]: booking.passengers.length,
    },
  });

  // ── Create Notification ───────────────────────────────────────
  await Notification.create({
    userId:  req.user._id,
    title:   'Booking Cancelled',
    message: `Your booking ${booking.pnr} has been cancelled. ${
      refundAmount > 0 ? `Refund of ₹${refundAmount} will be processed in 5-7 days.` : 'No refund applicable.'
    }`,
    type:            'booking_cancelled',
    relatedBookingId: booking._id,
    icon:            '❌',
    priority:        'high',
  });

  sendSuccess(res, 200, 'Booking cancelled successfully', {
    booking,
    refundAmount,
    refundMessage: refundAmount > 0
      ? `₹${refundAmount} will be refunded in 5–7 business days`
      : 'No refund applicable for cancellations within 4 hours of departure',
  });
});

// ── Apply / Validate Coupon ───────────────────────────────────
// POST /api/bookings/apply-coupon  (protected)
// Body: { code, amount }
exports.applyCoupon = catchAsync(async (req, res, next) => {
  const { code, amount } = req.body;

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) return next(new AppError('Invalid coupon code', 400));

  const { valid, message } = coupon.isValidForUser(req.user._id, amount);
  if (!valid) return next(new AppError(message, 400));

  const discount = coupon.calculateDiscount(amount);

  sendSuccess(res, 200, 'Coupon applied!', {
    coupon: {
      code:          coupon.code,
      description:   coupon.description,
      discountType:  coupon.discountType,
      discountValue: coupon.discountValue,
    },
    discount,
    finalAmount: amount - discount,
  });
});
