// ============================================================
// models/Booking.js — Booking Schema
// Created when a user confirms a booking after entering
// passenger details. Links a User to a Flight.
// ============================================================

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// ── Passenger Sub-schema ──────────────────────────────────────
// One entry per passenger in the booking
const passengerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Passenger name is required'],
    trim: true,
  },
  age: {
    type: Number,
    required: [true, 'Passenger age is required'],
    min: 0,
    max: 120,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
  },
  type: {
    type: String,
    enum: ['adult', 'child', 'infant'],
    default: 'adult',
    // adult: 12+, child: 2-11, infant: 0-1
  },
  passportNumber: {
    type: String,
    trim: true,
    default: '',
  },
  nationality: {
    type: String,
    default: 'Indian',
  },
  dateOfBirth: {
    type: Date,
  },
  seatNumber: {
    type: String,
    default: '', // e.g. "12A"
  },
  meal: {
    type: String,
    enum: ['none', 'veg', 'non-veg', 'vegan', 'jain'],
    default: 'none',
  },
});

// ── Add-ons Sub-schema ────────────────────────────────────────
const addOnsSchema = new mongoose.Schema({
  extraBaggage: {
    weight: { type: Number, default: 0 }, // extra kg purchased
    price:  { type: Number, default: 0 },
  },
  travelInsurance: {
    enabled: { type: Boolean, default: false },
    price:   { type: Number, default: 0 },
  },
  priorityBoarding: {
    enabled: { type: Boolean, default: false },
    price:   { type: Number, default: 0 },
  },
});

// ── GST Details Sub-schema ────────────────────────────────────
const gstSchema = new mongoose.Schema({
  enabled:     { type: Boolean, default: false },
  gstNumber:   { type: String, default: '' },
  companyName: { type: String, default: '' },
  email:       { type: String, default: '' },
  phone:       { type: String, default: '' },
});

// ── Main Booking Schema ───────────────────────────────────────
const bookingSchema = new mongoose.Schema(
  {
    // ── PNR / Booking Reference ───────────────────────────────
    pnr: {
      type: String,
      unique: true,
      // Auto-generated before saving (see pre-save hook below)
      // Format: SKY-XXXXXXXX (e.g. SKY-A3F92B1C)
    },

    // ── References to User and Flight ────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    flightId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flight',
      required: [true, 'Flight ID is required'],
    },

    // ── Trip Type ─────────────────────────────────────────────
    tripType: {
      type: String,
      enum: ['one-way', 'round-trip'],
      default: 'one-way',
    },

    // ── Return Flight (for round trips) ──────────────────────
    returnFlightId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flight',
      default: null,
    },

    // ── Passengers ────────────────────────────────────────────
    passengers: {
      type: [passengerSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one passenger is required',
      },
    },

    // ── Cabin Class ───────────────────────────────────────────
    cabinClass: {
      type: String,
      enum: ['economy', 'business', 'firstClass'],
      default: 'economy',
    },

    // ── Add-ons ───────────────────────────────────────────────
    addOns: {
      type: addOnsSchema,
      default: () => ({}),
    },

    // ── GST Details ───────────────────────────────────────────
    gstDetails: {
      type: gstSchema,
      default: () => ({}),
    },

    // ── Coupon Applied ────────────────────────────────────────
    couponCode: {
      type: String,
      default: null,
    },
    couponDiscount: {
      type: Number,
      default: 0, // discount amount in rupees
    },

    // ── Pricing Breakdown ─────────────────────────────────────
    pricing: {
      baseFare:   { type: Number, required: true }, // base ticket price
      taxes:      { type: Number, default: 0     }, // GST + airport charges
      addOnsFee:  { type: Number, default: 0     }, // extra baggage, insurance etc.
      discount:   { type: Number, default: 0     }, // coupon discount
      totalAmount:{ type: Number, required: true }, // final amount paid
    },

    // ── Booking Status ────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'refunded'],
      default: 'pending',
      // pending   → payment not done yet
      // confirmed → payment successful
      // cancelled → user cancelled
      // completed → flight has departed
      // refunded  → refund processed
    },

    // ── Cancellation Details ──────────────────────────────────
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundStatus: {
      type: String,
      enum: ['none', 'pending', 'processed'],
      default: 'none',
    },

    // ── Payment Reference ─────────────────────────────────────
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Pre-save Hook: Generate PNR ───────────────────────────────
// Automatically creates a unique PNR before first save
bookingSchema.pre('save', function (next) {
  if (!this.pnr) {
    // Take first 8 chars of a UUID, uppercase = e.g. "SKY-A3F92B1C"
    this.pnr = 'SKY-' + uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
  }
  next();
});

// ── Indexes ───────────────────────────────────────────────────
bookingSchema.index({ userId: 1, createdAt: -1 }); // user's booking history
bookingSchema.index({ status: 1 });
bookingSchema.index({ flightId: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
