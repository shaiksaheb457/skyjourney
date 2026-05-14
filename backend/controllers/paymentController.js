// ============================================================
// controllers/paymentController.js — Payment Gateway Logic
// Handles: Razorpay order creation + verification,
//          Stripe payment intent, refunds
// ============================================================

const Razorpay = require('razorpay');
const Stripe   = require('stripe');
const crypto   = require('crypto');

const Payment      = require('../models/Payment');
const Booking      = require('../models/Booking');
const Notification = require('../models/Notification');
const { sendBookingConfirmationEmail } = require('../utils/sendEmail');
const { AppError, catchAsync, sendSuccess } = require('../utils/errorHandler');

// Initialize payment gateways using keys from .env
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ── RAZORPAY ──────────────────────────────────────────────────

// Step 1: Create Razorpay Order
// POST /api/payments/razorpay/order  (protected)
// Body: { bookingId }
// Flow: Frontend calls this → gets orderId → opens Razorpay modal
exports.createRazorpayOrder = catchAsync(async (req, res, next) => {
  const { bookingId } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) return next(new AppError('Booking not found', 404));

  if (booking.userId.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized', 403));
  }

  if (booking.status !== 'pending') {
    return next(new AppError(`Booking is already ${booking.status}`, 400));
  }

  // Razorpay requires amount in paise (1 INR = 100 paise)
  const amountInPaise = Math.round(booking.pricing.totalAmount * 100);

  // Create an order on Razorpay's server
  const order = await razorpay.orders.create({
    amount:   amountInPaise,
    currency: 'INR',
    receipt:  booking.pnr, // our booking reference
    notes: {
      bookingId: bookingId,
      pnr:       booking.pnr,
      userId:    req.user._id.toString(),
    },
  });

  // Save payment record in our database
  const payment = await Payment.create({
    bookingId:       bookingId,
    userId:          req.user._id,
    amount:          booking.pricing.totalAmount,
    currency:        'INR',
    gateway:         'razorpay',
    razorpayOrderId: order.id,
    status:          'created',
  });

  // Link payment to booking
  await Booking.findByIdAndUpdate(bookingId, { paymentId: payment._id });

  sendSuccess(res, 200, 'Razorpay order created', {
    orderId:   order.id,
    amount:    amountInPaise,
    currency:  'INR',
    keyId:     process.env.RAZORPAY_KEY_ID,
    paymentId: payment._id,
    booking: {
      pnr:         booking.pnr,
      totalAmount: booking.pricing.totalAmount,
    },
  });
});

// Step 2: Verify Razorpay Payment
// POST /api/payments/razorpay/verify  (protected)
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId }
// Flow: Called AFTER user completes payment in Razorpay modal
exports.verifyRazorpayPayment = catchAsync(async (req, res, next) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    bookingId,
  } = req.body;

  // ── Verify Signature ──────────────────────────────────────────
  // Razorpay sends a signature. We recreate it using our secret key
  // and compare — if they match, payment is genuine.
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    // Signature doesn't match → payment is fraudulent
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { status: 'failed', failureReason: 'Signature verification failed' }
    );
    return next(new AppError('Payment verification failed. Possible fraud detected.', 400));
  }

  // ── Payment Verified — Update Records ─────────────────────────
  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      transactionId:     razorpay_payment_id,
      status:            'captured',
    },
    { new: true }
  );

  // Update booking status to confirmed
  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    { status: 'confirmed' },
    { new: true }
  ).populate('flightId').populate('userId', 'name email');

  // ── Send Confirmation Email ────────────────────────────────────
  try {
    await sendBookingConfirmationEmail(booking.userId.email, booking, booking.userId);
  } catch (err) {
    // Don't fail the whole request if email fails
    console.error('Email sending failed:', err.message);
  }

  // ── Create Notification ────────────────────────────────────────
  await Notification.createBookingNotification(req.user._id, booking);

  sendSuccess(res, 200, 'Payment successful! Booking confirmed.', {
    booking,
    payment,
  });
});

// ── STRIPE ────────────────────────────────────────────────────

// Create Stripe Payment Intent
// POST /api/payments/stripe/intent  (protected)
// Body: { bookingId }
exports.createStripeIntent = catchAsync(async (req, res, next) => {
  const { bookingId } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) return next(new AppError('Booking not found', 404));

  if (booking.userId.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized', 403));
  }

  // Amount in paise for INR
  const amountInPaise = Math.round(booking.pricing.totalAmount * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount:   amountInPaise,
    currency: 'inr',
    metadata: {
      bookingId: bookingId,
      pnr:       booking.pnr,
      userId:    req.user._id.toString(),
    },
  });

  // Save payment record
  const payment = await Payment.create({
    bookingId,
    userId:                req.user._id,
    amount:                booking.pricing.totalAmount,
    currency:              'INR',
    gateway:               'stripe',
    stripePaymentIntentId: paymentIntent.id,
    stripeClientSecret:    paymentIntent.client_secret,
    status:                'created',
  });

  sendSuccess(res, 200, 'Stripe payment intent created', {
    clientSecret: paymentIntent.client_secret,
    paymentId:    payment._id,
  });
});

// Confirm Stripe Payment (called after frontend confirms)
// POST /api/payments/stripe/confirm  (protected)
// Body: { paymentIntentId, bookingId }
exports.confirmStripePayment = catchAsync(async (req, res, next) => {
  const { paymentIntentId, bookingId } = req.body;

  // Retrieve payment intent from Stripe to verify status
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== 'succeeded') {
    return next(new AppError(`Payment not successful. Status: ${paymentIntent.status}`, 400));
  }

  // Update payment record
  const payment = await Payment.findOneAndUpdate(
    { stripePaymentIntentId: paymentIntentId },
    { status: 'captured', transactionId: paymentIntentId },
    { new: true }
  );

  // Confirm booking
  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    { status: 'confirmed' },
    { new: true }
  ).populate('flightId').populate('userId', 'name email');

  try {
    await sendBookingConfirmationEmail(booking.userId.email, booking, booking.userId);
  } catch (err) {
    console.error('Email failed:', err.message);
  }

  await Notification.createBookingNotification(req.user._id, booking);

  sendSuccess(res, 200, 'Stripe payment confirmed! Booking confirmed.', {
    booking,
    payment,
  });
});

// ── Get Payment Details ────────────────────────────────────────
// GET /api/payments/:paymentId  (protected)
exports.getPaymentById = catchAsync(async (req, res, next) => {
  const payment = await Payment.findById(req.params.paymentId)
    .populate('bookingId')
    .populate('userId', 'name email');

  if (!payment) return next(new AppError('Payment not found', 404));

  if (payment.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  sendSuccess(res, 200, 'Payment fetched', { payment });
});
