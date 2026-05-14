// hooks/useBooking.js — Custom hook for booking flow state management
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  setBookingFlight, setPassengers, setAddOns,
  applyCoupon, removeCoupon, setPricing,
  setBookingStep, setCompletedBooking, resetBooking,
} from '../store/slices/bookingSlice'
import {
  createBooking, applyCoupon as applyCouponAPI,
  createRazorpayOrder, verifyRazorpayPayment,
} from '../services/bookingService'
import toast from 'react-hot-toast'

const TAX_RATE    = 0.05   // 5% taxes
const MEAL_PRICE  = 250    // ₹250 per passenger
const SEAT_PRICE  = 150    // ₹150 per seat selection
const BAG_PRICES  = { '5kg': 500, '10kg': 900, '15kg': 1300 }

const useBooking = () => {
  const dispatch = useDispatch()
  const booking  = useSelector((state) => state.booking)
  const { flight, passengers, addOns, coupon, pricing, step, completedBooking, isLoading } = booking

  /**
   * Initialize booking with a flight
   */
  const initBooking = useCallback((flightData) => {
    dispatch(setBookingFlight(flightData))
    dispatch(resetBooking())
    dispatch(setBookingFlight(flightData))
  }, [dispatch])

  /**
   * Update passenger list
   */
  const updatePassengers = useCallback((passengerList) => {
    dispatch(setPassengers(passengerList))
    recalculatePricing(passengerList, addOns, coupon, flight)
  }, [dispatch, addOns, coupon, flight])

  /**
   * Update add-ons (meals, seats, baggage)
   */
  const updateAddOns = useCallback((newAddOns) => {
    dispatch(setAddOns(newAddOns))
    recalculatePricing(passengers, { ...addOns, ...newAddOns }, coupon, flight)
  }, [dispatch, passengers, coupon, flight, addOns])

  /**
   * Recalculate pricing based on current booking state
   */
  const recalculatePricing = useCallback((pax, addonsData, couponData, flightData, cabinClass = 'economy') => {
    if (!flightData) return

    const numPax    = pax?.length || 1
    const basePerPax= flightData.price?.[cabinClass] || 0
    const baseFare  = basePerPax * numPax

    // Add-ons fee
    const mealFee   = (addonsData?.meals?.length || 0) * MEAL_PRICE * numPax
    const seatFee   = (addonsData?.seats?.length || 0) * SEAT_PRICE
    const bagFee    = BAG_PRICES[addonsData?.baggage] || 0
    const addOnsFee = mealFee + seatFee + bagFee

    // Coupon discount
    let discount = 0
    if (couponData) {
      if (couponData.discountType === 'percent') {
        discount = Math.round((baseFare + addOnsFee) * couponData.discountValue / 100)
        if (couponData.maxDiscount) discount = Math.min(discount, couponData.maxDiscount)
      } else {
        discount = couponData.discountValue || 0
      }
    }

    const subtotal = baseFare + addOnsFee - discount
    const taxes    = Math.round(subtotal * TAX_RATE)
    const total    = subtotal + taxes

    dispatch(setPricing({ baseFare, taxes, addOnsFee, discount, total }))
  }, [dispatch])

  /**
   * Apply a coupon code
   */
  const handleApplyCoupon = useCallback(async (code) => {
    try {
      const res = await applyCouponAPI(code, pricing.baseFare + pricing.addOnsFee)
      dispatch(applyCoupon(res.data.coupon))
      toast.success(`Coupon applied! You saved ₹${res.data.discount}`)
      recalculatePricing(passengers, addOns, res.data.coupon, flight)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon code')
    }
  }, [dispatch, pricing, passengers, addOns, flight, recalculatePricing])

  /**
   * Remove applied coupon
   */
  const handleRemoveCoupon = useCallback(() => {
    dispatch(removeCoupon())
    recalculatePricing(passengers, addOns, null, flight)
    toast.success('Coupon removed')
  }, [dispatch, passengers, addOns, flight, recalculatePricing])

  /**
   * Advance or retreat booking step
   */
  const goToStep = useCallback((targetStep) => {
    dispatch(setBookingStep(targetStep))
  }, [dispatch])

  const nextStep = useCallback(() => {
    dispatch(setBookingStep(step + 1))
  }, [dispatch, step])

  const prevStep = useCallback(() => {
    dispatch(setBookingStep(Math.max(1, step - 1)))
  }, [dispatch, step])

  /**
   * Submit booking and initiate Razorpay payment
   */
  const submitBooking = useCallback(async (cabinClass = 'economy') => {
    if (!flight || passengers.length === 0) {
      toast.error('Booking data is incomplete')
      return null
    }
    try {
      const bookingPayload = {
        flightId:   flight._id,
        passengers,
        cabinClass,
        addOns,
        couponCode: coupon?.code,
      }
      const res = await createBooking(bookingPayload)
      dispatch(setCompletedBooking(res.data.booking))
      return res.data.booking
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking')
      return null
    }
  }, [dispatch, flight, passengers, addOns, coupon])

  /**
   * Initiate Razorpay payment for a booking
   */
  const initiatePayment = useCallback(async (bookingId, onSuccess, onFailure) => {
    try {
      const orderRes = await createRazorpayOrder(bookingId)
      const { orderId, amount, currency, keyId } = orderRes.data

      const options = {
        key:         keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name:        'SkyJourney',
        description: 'Flight Booking Payment',
        order_id:    orderId,
        handler: async (response) => {
          try {
            await verifyRazorpayPayment({ ...response, bookingId })
            toast.success('Payment successful!')
            onSuccess?.(response)
          } catch {
            toast.error('Payment verification failed')
            onFailure?.()
          }
        },
        prefill: {
          name:  passengers[0]?.name,
          email: '',
          contact: '',
        },
        theme: { color: '#2563eb' },
        modal: { ondismiss: () => onFailure?.() },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment')
      onFailure?.()
    }
  }, [passengers])

  /**
   * Clear all booking state
   */
  const clearBooking = useCallback(() => {
    dispatch(resetBooking())
  }, [dispatch])

  return {
    flight,
    passengers,
    addOns,
    coupon,
    pricing,
    step,
    completedBooking,
    isLoading,
    initBooking,
    updatePassengers,
    updateAddOns,
    recalculatePricing,
    handleApplyCoupon,
    handleRemoveCoupon,
    goToStep,
    nextStep,
    prevStep,
    submitBooking,
    initiatePayment,
    clearBooking,
  }
}

export default useBooking
