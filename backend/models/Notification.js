// ============================================================
// models/Notification.js — Notification Schema
// In-app notifications for users (booking confirmed, flight
// delayed, refund processed, offers etc.)
// ============================================================

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // ── Who Receives This Notification ────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },

    // ── Notification Content ──────────────────────────────────
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      // e.g. "Booking Confirmed!", "Flight Delayed"
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      // e.g. "Your booking SKY-A3F92B1C is confirmed. Have a great flight!"
    },

    // ── Notification Type ─────────────────────────────────────
    type: {
      type: String,
      enum: [
        'booking_confirmed',   // booking payment succeeded
        'booking_cancelled',   // user cancelled booking
        'payment_success',     // payment captured
        'payment_failed',      // payment failed
        'refund_initiated',    // refund started
        'refund_processed',    // refund done
        'flight_delayed',      // flight is delayed
        'flight_cancelled',    // airline cancelled flight
        'flight_reminder',     // reminder 24 hours before flight
        'offer',               // promotional offer
        'general',             // general info
      ],
      default: 'general',
    },

    // ── Related Entity ────────────────────────────────────────
    // Optional link to a booking or flight
    relatedBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    relatedFlightId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flight',
      default: null,
    },

    // ── Read Status ───────────────────────────────────────────
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },

    // ── Action Link ───────────────────────────────────────────
    // Frontend uses this to navigate when user clicks notification
    actionUrl: {
      type: String,
      default: null,
      // e.g. "/my-bookings" or "/booking/SKY-A3F92B1C"
    },

    // ── Icon / Emoji for UI ───────────────────────────────────
    icon: {
      type: String,
      default: '🔔',
      // Emoji shown in notification bell
    },

    // ── Priority ──────────────────────────────────────────────
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },

    // ── Expiry ────────────────────────────────────────────────
    // Auto-delete old notifications after 30 days
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

// ── Instance Method: Mark as Read ─────────────────────────────
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// ── Static Method: Create Booking Notification ────────────────
// Shortcut to create a booking confirmed notification
// Usage: await Notification.createBookingNotification(userId, booking)
notificationSchema.statics.createBookingNotification = async function (userId, booking) {
  return await this.create({
    userId,
    title: 'Booking Confirmed! ✈️',
    message: `Your booking ${booking.pnr} is confirmed. Have a great flight!`,
    type: 'booking_confirmed',
    relatedBookingId: booking._id,
    actionUrl: `/my-bookings`,
    icon: '✈️',
    priority: 'high',
  });
};

// ── Static Method: Create Flight Delay Notification ───────────
notificationSchema.statics.createDelayNotification = async function (userId, flight, delayMins) {
  return await this.create({
    userId,
    title: 'Flight Delayed ⏱️',
    message: `Your flight ${flight.flightNumber} is delayed by ${delayMins} minutes.`,
    type: 'flight_delayed',
    relatedFlightId: flight._id,
    actionUrl: `/my-bookings`,
    icon: '⏱️',
    priority: 'high',
  });
};

// ── TTL Index: Auto-delete after expiry ───────────────────────
// MongoDB will automatically delete documents when expiresAt is reached
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ── Other Indexes ─────────────────────────────────────────────
notificationSchema.index({ userId: 1, createdAt: -1 }); // user's notifications feed
notificationSchema.index({ userId: 1, isRead: 1 });     // unread count query

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
