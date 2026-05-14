// routes/bookingRoutes.js — Booking Routes
const express = require('express');
const router  = express.Router();
const { createBooking, getMyBookings, getBookingById, cancelBooking, applyCoupon } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // all booking routes require login

router.post('/create',          createBooking);
router.get('/my',               getMyBookings);
router.post('/apply-coupon',    applyCoupon);
router.get('/:id',              getBookingById);
router.post('/:id/cancel',      cancelBooking);

module.exports = router;
