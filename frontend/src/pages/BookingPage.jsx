// pages/BookingPage.jsx — Full booking form page
import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ArrowLeft, Shield, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar         from '../components/common/Navbar'
import Footer         from '../components/common/Footer'
import PassengerForm  from '../components/booking/PassengerForm'
import PriceSummary   from '../components/booking/PriceSummary'
import CouponInput    from '../components/booking/CouponInput'
import { getFlightById } from '../services/flightService'
import { createBooking } from '../services/bookingService'
import { selectUser }    from '../store/slices/authSlice'

const defaultPassenger = { name:'', age:'', gender:'', type:'adult', meal:'none', passportNumber:'' }

const BookingPage = () => {
  const { flightId }    = useParams()
  const [searchParams]  = useSearchParams()
  const navigate        = useNavigate()
  const user            = useSelector(selectUser)

  const cabinClass  = searchParams.get('cabinClass')  || 'economy'
  const numTravelers= parseInt(searchParams.get('travelers') || '1')

  const [flight, setFlight]         = useState(null)
  const [isLoading, setIsLoading]   = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize passenger list based on traveler count
  const [passengers, setPassengers] = useState(
    Array.from({ length: numTravelers }, () => ({ ...defaultPassenger }))
  )
  const [coupon, setCoupon]         = useState(null)
  const [addOns, setAddOns]         = useState({ travelInsurance: { enabled:false, price:299 }, priorityBoarding: { enabled:false, price:199 } })
  const [gstEnabled, setGstEnabled] = useState(false)
  const [gst, setGst]               = useState({ gstNumber:'', companyName:'', email:'', phone:'' })

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getFlightById(flightId)
        setFlight(data.data.flight)
      } catch { toast.error('Failed to load flight details') }
      finally { setIsLoading(false) }
    }
    fetch()
  }, [flightId])

  const updatePassenger = (index, updated) => {
    setPassengers(prev => prev.map((p, i) => i === index ? updated : p))
  }

  const validatePassengers = () => {
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i]
      if (!p.name?.trim()) { toast.error(`Enter name for Passenger ${i+1}`); return false }
      if (!p.age)          { toast.error(`Enter age for Passenger ${i+1}`);  return false }
      if (!p.gender)       { toast.error(`Select gender for Passenger ${i+1}`); return false }
    }
    return true
  }

  const handleProceed = async () => {
    if (!validatePassengers()) return
    setIsSubmitting(true)

    try {
      const baseFare   = (flight.price?.[cabinClass] || 0) * passengers.length
      const taxes      = Math.round(baseFare * 0.05)
      const addOnsFee  = (addOns.travelInsurance.enabled ? 299 : 0) + (addOns.priorityBoarding.enabled ? 199 : 0)
      const discount   = coupon?.discount || 0
      const totalAmount= baseFare + taxes + addOnsFee - discount

      const bookingData = {
        flightId,
        passengers,
        cabinClass,
        addOns,
        gstDetails: { enabled: gstEnabled, ...gst },
        couponCode: coupon?.code,
        pricing: { baseFare, taxes, addOnsFee, discount, totalAmount },
      }

      const data = await createBooking(bookingData)
      toast.success('Booking created! Proceeding to payment...')
      navigate('/payment', { state: { bookingId: data.data.booking._id, booking: data.data.booking, flight } })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking')
    } finally { setIsSubmitting(false) }
  }

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading flight details...</p>
        </div>
      </div>
    </div>
  )

  if (!flight) return (
    <div className="min-h-screen bg-gray-50 flex flex-col"><Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center"><p className="text-xl text-gray-600">Flight not found</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">← Go back</button>
        </div>
      </div>
    </div>
  )

  const baseFare  = (flight.price?.[cabinClass] || 0) * passengers.length
  const taxes     = Math.round(baseFare * 0.05)
  const addOnsFee = (addOns.travelInsurance.enabled ? 299 : 0) + (addOns.priorityBoarding.enabled ? 199 : 0)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Progress bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-0">
            {['Passenger Details','Add-ons','Payment'].map((s,i) => (
              <div key={s} className="flex items-center gap-0 flex-1 last:flex-none">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{i+1}</div>
                  <span className={`text-xs font-medium hidden sm:block ${i === 0 ? 'text-blue-600' : 'text-gray-400'}`}>{s}</span>
                </div>
                {i < 2 && <div className="flex-1 h-px bg-gray-200 mx-3" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-5">
          <ArrowLeft className="w-4 h-4" /> Back to search
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column */}
          <div className="flex-1 space-y-5">
            {/* Passenger forms */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Passenger Details</h2>
              <div className="space-y-3">
                {passengers.map((p, i) => (
                  <PassengerForm key={i} index={i} passenger={p} onChange={updatePassenger}
                    savedTravelers={user?.savedTravelers || []} />
                ))}
              </div>
            </div>

            {/* Add-ons */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-base font-bold text-gray-900 mb-4">Add-ons</h2>
              <div className="space-y-3">
                {[
                  { key:'travelInsurance', label:'Travel Insurance', desc:'Coverage for trip cancellation, medical emergencies', price:299, emoji:'🛡️' },
                  { key:'priorityBoarding',label:'Priority Boarding', desc:'Board the flight before other passengers', price:199, emoji:'🏃' },
                ].map(addon => (
                  <div key={addon.key} onClick={() => setAddOns(prev => ({ ...prev, [addon.key]: { ...prev[addon.key], enabled: !prev[addon.key].enabled } }))}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${addOns[addon.key].enabled ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <span className="text-2xl">{addon.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{addon.label}</p>
                      <p className="text-xs text-gray-500">{addon.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-700">+₹{addon.price}</p>
                      <div className={`w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center ml-auto ${addOns[addon.key].enabled ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                        {addOns[addon.key].enabled && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-base font-bold text-gray-900 mb-3">Coupon / Promo Code</h2>
              <CouponInput totalAmount={baseFare + taxes + addOnsFee}
                appliedCoupon={coupon} onApply={setCoupon} onRemove={() => setCoupon(null)} />
            </div>

            {/* GST */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">GST Details</h2>
                  <p className="text-xs text-gray-400 mt-0.5">For business travel tax benefits</p>
                </div>
                <button onClick={() => setGstEnabled(!gstEnabled)}
                  className={`w-11 h-6 rounded-full transition-all relative ${gstEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${gstEnabled ? 'left-5.5' : 'left-0.5'}`} style={{left: gstEnabled ? '22px' : '2px'}} />
                </button>
              </div>
              {gstEnabled && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key:'gstNumber',   label:'GST Number',   placeholder:'22AAAAA0000A1Z5' },
                    { key:'companyName', label:'Company Name', placeholder:'Your Company Ltd' },
                    { key:'email',       label:'Email',        placeholder:'billing@company.com' },
                    { key:'phone',       label:'Phone',        placeholder:'9876543210' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                      <input value={gst[f.key]} onChange={e => setGst(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Security note */}
            <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700">Your personal data is encrypted and secure. We never share your information.</p>
            </div>
          </div>

          {/* Right column — price summary */}
          <div className="lg:w-80 flex-shrink-0">
            <PriceSummary flight={flight} passengers={passengers} addOns={addOns}
              coupon={coupon} cabinClass={cabinClass} onProceed={handleProceed} isLoading={isSubmitting} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default BookingPage
