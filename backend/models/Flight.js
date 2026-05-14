// ============================================================
// models/Flight.js — Flight Schema
// Stores all available flights with pricing, seats, schedule
// ============================================================

const mongoose = require('mongoose');

// ── Layover Sub-schema ────────────────────────────────────────
// Used for flights with stops — stores airport + wait time
const layoverSchema = new mongoose.Schema({
  airport: {
    type: String,
    required: true, // e.g. "BOM" (Mumbai airport code)
  },
  airportName: {
    type: String,   // e.g. "Chhatrapati Shivaji Maharaj International Airport"
  },
  duration: {
    type: Number,   // layover duration in minutes
    required: true,
  },
});

// ── Seat Availability Sub-schema ──────────────────────────────
const seatSchema = new mongoose.Schema({
  economy: {
    total:     { type: Number, default: 150 },
    available: { type: Number, default: 150 },
  },
  business: {
    total:     { type: Number, default: 20 },
    available: { type: Number, default: 20 },
  },
  firstClass: {
    total:     { type: Number, default: 8 },
    available: { type: Number, default: 8 },
  },
});

// ── Main Flight Schema ────────────────────────────────────────
const flightSchema = new mongoose.Schema(
  {
    // ── Airline Info ─────────────────────────────────────────
    airline: {
      type: String,
      required: [true, 'Airline name is required'],
      trim: true,
      // e.g. "IndiGo", "Air India", "SpiceJet"
    },
    airlineCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      // e.g. "6E" for IndiGo, "AI" for Air India
    },
    airlineLogo: {
      type: String,
      default: '', // URL to airline logo image
    },
    flightNumber: {
      type: String,
      required: [true, 'Flight number is required'],
      uppercase: true,
      trim: true,
      // e.g. "6E-2001"
    },

    // ── Route ────────────────────────────────────────────────
    from: {
      city:        { type: String, required: true }, // e.g. "Delhi"
      airport:     { type: String, required: true }, // e.g. "Indira Gandhi International Airport"
      airportCode: { type: String, required: true, uppercase: true }, // e.g. "DEL"
    },
    to: {
      city:        { type: String, required: true },
      airport:     { type: String, required: true },
      airportCode: { type: String, required: true, uppercase: true },
    },

    // ── Schedule ─────────────────────────────────────────────
    departureTime: {
      type: Date,
      required: [true, 'Departure time is required'],
    },
    arrivalTime: {
      type: Date,
      required: [true, 'Arrival time is required'],
    },
    duration: {
      type: Number, // total flight duration in minutes
      required: true,
    },

    // ── Stops / Layovers ──────────────────────────────────────
    stops: {
      type: Number,
      default: 0,   // 0 = non-stop, 1 = one stop, etc.
      min: 0,
      max: 3,
    },
    layovers: [layoverSchema], // empty array for non-stop flights

    // ── Pricing ───────────────────────────────────────────────
    price: {
      economy: {
        type: Number,
        required: [true, 'Economy price is required'],
        min: [0, 'Price cannot be negative'],
      },
      business: {
        type: Number,
        default: 0,
      },
      firstClass: {
        type: Number,
        default: 0,
      },
    },

    // ── Seats ─────────────────────────────────────────────────
    seats: {
      type: seatSchema,
      default: () => ({}),
    },

    // ── Baggage Policy ────────────────────────────────────────
    baggage: {
      cabin:   { type: String, default: '7 kg' },   // carry-on allowance
      checkin: { type: String, default: '15 kg' },  // check-in allowance
    },

    // ── Amenities ─────────────────────────────────────────────
    amenities: {
      meals:    { type: Boolean, default: false },
      wifi:     { type: Boolean, default: false },
      usb:      { type: Boolean, default: true  },
      entertainment: { type: Boolean, default: false },
    },

    // ── Refund Policy ─────────────────────────────────────────
    refundable: {
      type: Boolean,
      default: true,
    },
    cancellationCharge: {
      type: Number,
      default: 500, // in rupees
    },

    // ── Status ────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['scheduled', 'delayed', 'cancelled', 'completed'],
      default: 'scheduled',
    },
    delayMinutes: {
      type: Number,
      default: 0,
    },

    // ── Recurring Schedule ────────────────────────────────────
    // Which days of the week this flight operates
    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    operatingDays: {
      type: [Number],
      default: [0, 1, 2, 3, 4, 5, 6], // every day by default
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────
// Makes flight search queries fast
flightSchema.index({ 'from.airportCode': 1, 'to.airportCode': 1, departureTime: 1 });
flightSchema.index({ airline: 1 });
flightSchema.index({ status: 1 });
flightSchema.index({ 'price.economy': 1 });

// ── Virtual: Duration in Hours & Minutes ─────────────────────
// Usage: flight.durationFormatted → "2h 30m"
flightSchema.virtual('durationFormatted').get(function () {
  const hours   = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  return `${hours}h ${minutes}m`;
});

const Flight = mongoose.model('Flight', flightSchema);
module.exports = Flight;
