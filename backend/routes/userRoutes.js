// routes/userRoutes.js — User Profile Routes
const express = require('express');
const router  = express.Router();
const { getProfile, updateProfile, addSavedTraveler, getSavedTravelers, deleteSavedTraveler, addToWishlist, removeFromWishlist } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // all user routes require login

router.get('/',                        getProfile);
router.put('/',                        updateProfile);
router.get('/travelers',               getSavedTravelers);
router.post('/travelers',              addSavedTraveler);
router.delete('/travelers/:travelerId',deleteSavedTraveler);
router.post('/wishlist',               addToWishlist);
router.delete('/wishlist/:routeId',    removeFromWishlist);

module.exports = router;
