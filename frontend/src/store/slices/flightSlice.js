import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  searchParams: {
    from: '',
    to: '',
    departureDate: '',
    returnDate: '',
    travelers: 1,
    cabinClass: 'economy',
    tripType: 'one-way',
  },
  flights: [],
  selectedFlight: null,
  filters: {
    maxPrice: 50000,
    airlines: [],
    stops: [],
    departureTime: [],
  },
  sortBy: 'cheapest',
  isLoading: false,
  error: null,
  totalResults: 0,
}

const flightSlice = createSlice({
  name: 'flights',
  initialState,
  reducers: {
    setSearchParams: (state, action) => {
      state.searchParams = { ...state.searchParams, ...action.payload }
    },
    setFlights: (state, action) => {
      state.flights = action.payload.flights
      state.totalResults = action.payload.total || action.payload.flights.length
    },
    setSelectedFlight: (state, action) => {
      state.selectedFlight = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload
    },
    setLoading: (state, action) => { state.isLoading = action.payload },
    setError: (state, action) => { state.error = action.payload },
    clearFlights: (state) => {
      state.flights = []
      state.totalResults = 0
    },
  },
})

export const {
  setSearchParams, setFlights, setSelectedFlight,
  setFilters, setSortBy, setLoading, setError, clearFlights,
} = flightSlice.actions
export default flightSlice.reducer