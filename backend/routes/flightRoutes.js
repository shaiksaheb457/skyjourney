// routes/flightRoutes.js — Flight Routes
const express = require('express');
const router  = express.Router();
const { searchFlights, getFlightById, getAirlines, getPopularRoutes, getFlightStatus, checkSeatAvailability } = require('../controllers/flightController');

// All flight routes are public (no login needed to search)
router.get('/search',            searchFlights);
router.get('/airlines',          getAirlines);
router.get('/popular-routes',    getPopularRoutes);
router.get('/:id',               getFlightById);
router.get('/:id/status',        getFlightStatus);
router.get('/:id/seats',         checkSeatAvailability);

module.exports = router;
