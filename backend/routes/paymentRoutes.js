// routes/paymentRoutes.js — Payment Routes
const express = require('express');
const router  = express.Router();
const { createRazorpayOrder, verifyRazorpayPayment, createStripeIntent, confirmStripePayment, getPaymentById } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // all payment routes require login

router.post('/razorpay/order',   createRazorpayOrder);
router.post('/razorpay/verify',  verifyRazorpayPayment);
router.post('/stripe/intent',    createStripeIntent);
router.post('/stripe/confirm',   confirmStripePayment);
router.get('/:paymentId',        getPaymentById);

module.exports = router;
