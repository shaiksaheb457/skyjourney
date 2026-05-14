import { configureStore } from '@reduxjs/toolkit'
import authReducer    from './slices/authSlice'
import flightReducer  from './slices/flightSlice'
import bookingReducer from './slices/bookingSlice'

export const store = configureStore({
  reducer: {
    auth:    authReducer,
    flights: flightReducer,
    booking: bookingReducer,
  },
})

export default store