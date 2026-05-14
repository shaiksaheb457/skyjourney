// routes/adminRoutes.js — Admin Routes (role: admin only)
const express = require('express');
const router  = express.Router();
const { getAllFlights, createFlight, updateFlight, deleteFlight, updateFlightStatus, getAllUsers, toggleUserStatus, getAllBookings, getRevenueDashboard, createCoupon, getAllCoupons, toggleCoupon, deleteCoupon } = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Every admin route requires: 1) logged in, 2) role = admin
router.use(protect, restrictTo('admin'));

// Flights
router.get('/flights',               getAllFlights);
router.post('/flights',              createFlight);
router.put('/flights/:id',           updateFlight);
router.delete('/flights/:id',        deleteFlight);
router.patch('/flights/:id/status',  updateFlightStatus);

// Users
router.get('/users',                        getAllUsers);
router.patch('/users/:id/toggle-status',    toggleUserStatus);

// Bookings
router.get('/bookings',              getAllBookings);

// Revenue
router.get('/revenue',               getRevenueDashboard);

// Coupons
router.get('/coupons',               getAllCoupons);
router.post('/coupons',              createCoupon);
router.patch('/coupons/:id/toggle',  toggleCoupon);
router.delete('/coupons/:id',        deleteCoupon);

module.exports = router;
