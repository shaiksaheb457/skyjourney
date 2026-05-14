// ============================================================
// models/Payment.js — Payment Schema
// Tracks every payment transaction for bookings.
// Supports both Razorpay and Stripe gateways.
// ============================================================

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────────────
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking ID is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },

    // ── Amount ────────────────────────────────────────────────
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      // INR for Razorpay, USD/INR for Stripe
    },

    // ── Payment Gateway ───────────────────────────────────────
    gateway: {
      type: String,
      enum: ['razorpay', 'stripe', 'wallet', 'upi'],
      required: [true, 'Payment gateway is required'],
    },

    // ── Razorpay Specific Fields ──────────────────────────────
    razorpayOrderId: {
      type: String,
      default: null,
      // Created by Razorpay when you call orders.create()
      // e.g. "order_OqS3tEDRoaCJHy"
    },
    razorpayPaymentId: {
      type: String,
      default: null,
      // Returned after successful payment
      // e.g. "pay_OqS3xHtFJz1234"
    },
    razorpaySignature: {
      type: String,
      default: null,
      // HMAC signature used to verify payment authenticity
    },

    // ── Stripe Specific Fields ────────────────────────────────
    stripePaymentIntentId: {
      type: String,
      default: null,
      // e.g. "pi_3OqS3tFJz12345"
    },
    stripeClientSecret: {
      type: String,
      default: null,
    },

    // ── Transaction ID (generic) ──────────────────────────────
    transactionId: {
      type: String,
      default: null,
      // The main ID we store regardless of gateway
    },

    // ── Payment Status ────────────────────────────────────────
    status: {
      type: String,
      enum: ['created', 'pending', 'captured', 'failed', 'refunded'],
      default: 'created',
      // created  → order created, payment not started
      // pending  → user opened payment screen
      // captured → money successfully deducted
      // failed   → payment failed
      // refunded → money sent back to user
    },

    // ── Refund Details ────────────────────────────────────────
    refundId: {
      type: String,
      default: null, // Razorpay/Stripe refund ID
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundedAt: {
      type: Date,
      default: null,
    },

    // ── Payment Method Details ────────────────────────────────
    paymentMethod: {
      type: String,
      default: '',
      // e.g. "card", "upi", "netbanking", "wallet"
    },
    cardLast4: {
      type: String,
      default: null,
      // Last 4 digits of card (safe to store)
    },
    cardBrand: {
      type: String,
      default: null,
      // e.g. "Visa", "Mastercard"
    },

    // ── Invoice Number ────────────────────────────────────────
    invoiceNumber: {
      type: String,
      default: null,
      // e.g. "INV-2024-001234"
    },

    // ── Metadata / Notes ──────────────────────────────────────
    notes: {
      type: String,
      default: '',
    },
    failureReason: {
      type: String,
      default: null,
      // Stores why a payment failed (for debugging)
    },
  },
  {
    timestamps: true,
  }
);

// ── Pre-save Hook: Generate Invoice Number ────────────────────
paymentSchema.pre('save', function (next) {
  if (!this.invoiceNumber && this.status === 'captured') {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    this.invoiceNumber = `INV-${year}-${random}`;
  }
  next();
});

// ── Indexes ───────────────────────────────────────────────────
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ transactionId: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
