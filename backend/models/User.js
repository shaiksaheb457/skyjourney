// ============================================================
// models/User.js — User Schema
// Stores all registered users (both regular users and admins)
// ============================================================

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// ── Saved Traveler Sub-schema ─────────────────────────────────
// Users can save frequent travelers (family members etc.)
// so they don't have to re-enter details every booking
const savedTravelerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
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
});

// ── Main User Schema ──────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,           // no two users with same email
      lowercase: true,        // always store as lowercase
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },

    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never return password in queries by default
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    profilePic: {
      type: String,
      default: '', // URL to uploaded profile picture
    },

    // ── Saved Travelers ──────────────────────────────────────
    // Array of frequent flyers the user has added
    savedTravelers: [savedTravelerSchema],

    // ── Wishlist / Favorite Routes ───────────────────────────
    wishlist: [
      {
        from: String,
        to: String,
        addedAt: { type: Date, default: Date.now },
      },
    ],

    // ── Password Reset OTP ───────────────────────────────────
    resetOTP: {
      type: String,
      default: null,
    },
    resetOTPExpiry: {
      type: Date,
      default: null,
    },

    // ── Account Status ───────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

// ── Pre-save Hook: Hash Password ──────────────────────────────
// Runs automatically BEFORE saving a user to the database.
// If the password field was changed, hash it before storing.
// This means the real password is NEVER stored in MongoDB.
userSchema.pre('save', async function (next) {
  // Only hash if password was actually modified (not on profile updates)
  if (!this.isModified('password')) return next();

  // bcrypt hash with salt rounds = 12 (higher = more secure but slower)
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance Method: Compare Password ────────────────────────
// Called during login to check if entered password matches stored hash.
// Usage: const isMatch = await user.comparePassword(enteredPassword)
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── Instance Method: Generate OTP ─────────────────────────────
// Creates a 6-digit OTP and saves it with a 10-minute expiry
userSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.resetOTP = otp;
  this.resetOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return otp;
};

// ── Index ─────────────────────────────────────────────────────
// Makes email lookups faster (used in login)
const User = mongoose.model('User', userSchema);
module.exports = User;
