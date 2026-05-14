// ============================================================
// controllers/flightController.js — Flight Search & Details
// Handles: search flights, get flight by ID, popular routes,
//          airlines list
// ============================================================

const Flight  = require('../models/Flight');
const Booking = require('../models/Booking');
const { AppError, catchAsync, sendSuccess } = require('../utils/errorHandler');

// ── Search Flights ────────────────────────────────────────────
// GET /api/flights/search
// Query: from, to, departureDate, travelers, cabinClass, tripType
exports.searchFlights = catchAsync(async (req, res, next) => {
  const {
    from,
    to,
    departureDate,
    travelers   = 1,
    cabinClass  = 'economy',
    sortBy      = 'cheapest',
    // Filters
    maxPrice,
    airlines,
    stops,
    page        = 1,
    limit       = 10,
  } = req.query;

  if (!from || !to || !departureDate) {
    return next(new AppError('Please provide from, to, and departureDate', 400));
  }

  // Build the date range for the departure date
  // Search entire day: from 00:00 to 23:59
  const searchDate  = new Date(departureDate);
  const startOfDay  = new Date(searchDate.setHours(0, 0, 0, 0));
  const endOfDay    = new Date(searchDate.setHours(23, 59, 59, 999));

  // ── Build Query ──────────────────────────────────────────────
  const query = {
    'from.airportCode': from.toUpperCase(),
    'to.airportCode':   to.toUpperCase(),
    departureTime: { $gte: startOfDay, $lte: endOfDay },
    status: 'scheduled',
    // Ensure enough seats are available for all travelers
    [`seats.${cabinClass}.available`]: { $gte: parseInt(travelers) },
  };

  // Optional: filter by max price
  if (maxPrice) {
    query[`price.${cabinClass}`] = { $lte: parseInt(maxPrice) };
  }

  // Optional: filter by specific airlines (comma-separated string)
  if (airlines) {
    query.airline = { $in: airlines.split(',') };
  }

  // Optional: filter by number of stops
  if (stops !== undefined) {
    query.stops = { $in: stops.split(',').map(Number) };
  }

  // ── Sort Options ─────────────────────────────────────────────
  let sortOption = {};
  if (sortBy === 'cheapest')  sortOption = { [`price.${cabinClass}`]: 1 };
  if (sortBy === 'fastest')   sortOption = { duration: 1 };
  if (sortBy === 'departure') sortOption = { departureTime: 1 };
  if (sortBy === 'arrival')   sortOption = { arrivalTime: 1 };

  // ── Pagination ────────────────────────────────────────────────
  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await Flight.countDocuments(query);

  const flights = await Flight.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit));

  sendSuccess(res, 200, `${total} flights found`, {
    flights,
    total,
    page:       parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    searchParams: { from, to, departureDate, travelers, cabinClass },
  });
});

// ── Get Single Flight ─────────────────────────────────────────
// GET /api/flights/:id
exports.getFlightById = catchAsync(async (req, res, next) => {
  const flight = await Flight.findById(req.params.id);

  if (!flight) {
    return next(new AppError('Flight not found', 404));
  }

  sendSuccess(res, 200, 'Flight fetched', { flight });
});

// ── Get All Airlines ──────────────────────────────────────────
// GET /api/flights/airlines
// Returns unique list of airlines for the filter dropdown
exports.getAirlines = catchAsync(async (req, res, next) => {
  const airlines = await Flight.distinct('airline');
  sendSuccess(res, 200, 'Airlines fetched', { airlines });
});

// ── Get Popular Routes ────────────────────────────────────────
// GET /api/flights/popular-routes
// Returns most booked routes for the homepage
exports.getPopularRoutes = catchAsync(async (req, res, next) => {
  // Aggregate to find the top 6 most booked routes
  const popularRoutes = await Booking.aggregate([
    { $match: { status: 'confirmed' } },
    {
      $lookup: {
        from: 'flights',
        localField: 'flightId',
        foreignField: '_id',
        as: 'flight',
      },
    },
    { $unwind: '$flight' },
    {
      $group: {
        _id: {
          from: '$flight.from.city',
          to:   '$flight.to.city',
          fromCode: '$flight.from.airportCode',
          toCode:   '$flight.to.airportCode',
        },
        bookingCount: { $sum: 1 },
        minPrice: { $min: '$flight.price.economy' },
      },
    },
    { $sort: { bookingCount: -1 } },
    { $limit: 6 },
  ]);

  // If no bookings yet, return some default popular routes
  const defaultRoutes = [
    { from: 'Delhi', to: 'Mumbai', fromCode: 'DEL', toCode: 'BOM', minPrice: 3500 },
    { from: 'Delhi', to: 'Bangalore', fromCode: 'DEL', toCode: 'BLR', minPrice: 4200 },
    { from: 'Mumbai', to: 'Goa', fromCode: 'BOM', toCode: 'GOI', minPrice: 2800 },
    { from: 'Hyderabad', to: 'Delhi', fromCode: 'HYD', toCode: 'DEL', minPrice: 3900 },
    { from: 'Chennai', to: 'Mumbai', fromCode: 'MAA', toCode: 'BOM', minPrice: 3100 },
    { from: 'Kolkata', to: 'Delhi', fromCode: 'CCU', toCode: 'DEL', minPrice: 4500 },
  ];

  const routes = popularRoutes.length > 0
    ? popularRoutes.map(r => ({
        from:     r._id.from,
        to:       r._id.to,
        fromCode: r._id.fromCode,
        toCode:   r._id.toCode,
        minPrice: r.minPrice,
        bookingCount: r.bookingCount,
      }))
    : defaultRoutes;

  sendSuccess(res, 200, 'Popular routes fetched', { routes });
});

// ── Get Flight Status ─────────────────────────────────────────
// GET /api/flights/:id/status
exports.getFlightStatus = catchAsync(async (req, res, next) => {
  const flight = await Flight.findById(req.params.id)
    .select('flightNumber status departureTime arrivalTime delayMinutes airline');

  if (!flight) return next(new AppError('Flight not found', 404));

  sendSuccess(res, 200, 'Flight status fetched', { flight });
});

// ── Check Seat Availability ───────────────────────────────────
// GET /api/flights/:id/seats?cabinClass=economy
exports.checkSeatAvailability = catchAsync(async (req, res, next) => {
  const { cabinClass = 'economy' } = req.query;
  const flight = await Flight.findById(req.params.id).select('seats');

  if (!flight) return next(new AppError('Flight not found', 404));

  sendSuccess(res, 200, 'Seat availability fetched', {
    seats: flight.seats[cabinClass],
  });
});
