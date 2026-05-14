// services/bookingService.js
import api from './api'

export const createBooking         = async (data)       => (await api.post('/bookings/create', data)).data
export const getMyBookings         = async (params)     => (await api.get('/bookings/my', { params })).data
export const getBookingById        = async (id)         => (await api.get(`/bookings/${id}`)).data
export const cancelBooking         = async (id, reason) => (await api.post(`/bookings/${id}/cancel`, { reason })).data
export const applyCoupon           = async (code, amt)  => (await api.post('/bookings/apply-coupon', { code, amount: amt })).data
export const createRazorpayOrder   = async (bookingId)  => (await api.post('/payments/razorpay/order', { bookingId })).data
export const verifyRazorpayPayment = async (data)       => (await api.post('/payments/razorpay/verify', data)).data
