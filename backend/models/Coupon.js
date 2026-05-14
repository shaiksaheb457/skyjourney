// ============================================================
// models/Coupon.js — Coupon / Promo Code Schema
// Admin creates coupons; users apply them at checkout
// ============================================================

const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    // ── Coupon Code ───────────────────────────────────────────
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,   // always stored as uppercase
      trim: true,
      // e.g. "SUMMER20", "FIRSTFLY", "SAVE500"
    },

    // ── Description ───────────────────────────────────────────
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      // e.g. "Get 20% off on your first booking"
    },

    // ── Discount Type ─────────────────────────────────────────
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      required: [true, 'Discount type is required'],
      // percentage → e.g. 20% off
      // flat       → e.g. ₹500 off
    },

    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
      // For percentage: 20 means 20%
      // For flat: 500 means ₹500 off
    },

    // ── Maximum Discount Cap ──────────────────────────────────
    // Only applies for percentage discounts
    // e.g. 20% off but maximum ₹1000 discount
    maxDiscount: {
      type: Number,
      default: null, // null = no cap
    },

    // ── Minimum Order Value ───────────────────────────────────
    // User must spend at least this much to use the coupon
    minOrderValue: {
      type: Number,
      default: 0,
    },

    // ── Usage Limits ──────────────────────────────────────────
    usageLimit: {
      type: Number,
      default: null, // null = unlimited usage
    },
    usedCount: {
      type: Number,
      default: 0, // how many times coupon has been used so far
    },

    // ── Per-user Limit ────────────────────────────────────────
    // How many times a single user can use this coupon
    perUserLimit: {
      type: Number,
      default: 1,
    },

    // ── Users Who Used This Coupon ────────────────────────────
    usedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
        usedCount: {
          type: Number,
          default: 1,
        },
      },
    ],

    // ── Validity Period ───────────────────────────────────────
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },

    // ── Restrictions ──────────────────────────────────────────
    // Which cabin classes the coupon applies to
    applicableFor: {
      type: [String],
      enum: ['economy', 'business', 'firstClass', 'all'],
      default: ['all'],
    },

    // Specific airlines this coupon applies to (empty = all airlines)
    applicableAirlines: {
      type: [String],
      default: [], // empty array = applies to all airlines
    },

    // ── Status ────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Instance Method: Check if Coupon is Valid ─────────────────
// Usage: const { valid, message } = coupon.isValidForUser(userId, orderAmount)
couponSchema.methods.isValidForUser = function (userId, orderAmount) {
  const now = new Date();

  // Check if coupon is active
  if (!this.isActive) {
    return { valid: false, message: 'This coupon is inactive' };
  }

  // Check expiry
  if (now > this.expiresAt) {
    return { valid: false, message: 'This coupon has expired' };
  }

  // Check start date
  if (now < this.startDate) {
    return { valid: false, message: 'This coupon is not active yet' };
  }

  // Check overall usage limit
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, message: 'This coupon has reached its usage limit' };
  }

  // Check minimum order value
  if (orderAmount < this.minOrderValue) {
    return {
      valid: false,
      message: `Minimum order value of ₹${this.minOrderValue} required`,
    };
  }

  // Check per-user usage
  const userUsage = this.usedBy.find(
    (u) => u.userId.toString() === userId.toString()
  );
  if (userUsage && userUsage.usedCount >= this.perUserLimit) {
    return { valid: false, message: 'You have already used this coupon' };
  }

  return { valid: true, message: 'Coupon applied successfully' };
};

// ── Instance Method: Calculate Discount ──────────────────────
// Returns the actual discount amount to deduct from total
couponSchema.methods.calculateDiscount = function (orderAmount) {
  let discount = 0;

  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountValue) / 100;
    // Apply max discount cap if set
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    // flat discount
    discount = this.discountValue;
  }

  // Discount cannot exceed order amount
  return Math.min(discount, orderAmount);
};

// ── Indexes ───────────────────────────────────────────────────
couponSchema.index({ isActive: 1, expiresAt: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
