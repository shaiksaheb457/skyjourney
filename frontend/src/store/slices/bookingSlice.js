import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  flight: null,
  passengers: [],
  addOns: { meals: [], seats: [], baggage: null },
  coupon: null,
  pricing: {
    baseFare: 0,
    taxes: 0,
    addOnsFee: 0,
    discount: 0,
    total: 0,
  },
  step: 1,
  completedBooking: null,
  isLoading: false,
  error: null,
}

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setBookingFlight: (state, action) => { state.flight = action.payload },
    setPassengers: (state, action) => { state.passengers = action.payload },
    setAddOns: (state, action) => {
      state.addOns = { ...state.addOns, ...action.payload }
    },
    applyCoupon: (state, action) => { state.coupon = action.payload },
    removeCoupon: (state) => { state.coupon = null },
    setPricing: (state, action) => { state.pricing = action.payload },
    setBookingStep: (state, action) => { state.step = action.payload },
    setCompletedBooking: (state, action) => { state.completedBooking = action.payload },
    resetBooking: () => ({ ...initialState }),
  },
})

export const {
  setBookingFlight, setPassengers, setAddOns,
  applyCoupon, removeCoupon, setPricing,
  setBookingStep, setCompletedBooking, resetBooking,
} = bookingSlice.actions
export default bookingSlice.reducer