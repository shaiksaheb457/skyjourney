// pages/FlightDetailsPage.jsx — Full flight detail view with seat map & booking CTA
import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Clock, Wifi, Utensils, Luggage,
  RefreshCcw, ShieldCheck, Plane, Star,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar          from '../components/common/Navbar'
import Footer          from '../components/common/Footer'
import Loader          from '../components/common/Loader'
import FlightTimeline  from '../components/flight/FlightTimeline'
import SeatMap         from '../components/flight/SeatMap'
import { getFlightById } from '../services/flightService'
import { formatCurrency, formatDate, formatDuration } from '../utils/formatters'

const CABIN_OPTIONS = [
  { key: 'economy',   label: 'Economy'     },
  { key: 'business',  label: 'Business'    },
  { key: 'firstClass', label: 'First Class' },
]

const InfoChip = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
    <Icon className="w-3.5 h-3.5 text-gray-400" />
    {label}
  </div>
)

const FlightDetailsPage = () => {
  const { id }           = useParams()
  const [searchParams]   = useSearchParams()
  const navigate         = useNavigate()

  const initialCabin     = searchParams.get('cabinClass') || 'economy'
  const initialTravelers = parseInt(searchParams.get('travelers') || '1')

  const [flight,    setFlight]    = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cabin,     setCabin]     = useState(initialCabin)
  const [travelers, setTravelers] = useState(initialTravelers)
  const [showSeats, setShowSeats] = useState(false)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const res = await getFlightById(id)
        setFlight(res.data?.flight || res.data)
      } catch {
        toast.error('Failed to load flight details')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id])

  if (isLoading) return <><Navbar /><Loader fullPage text="Loading flight details…" /></>

  if (!flight) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Plane className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">Flight not found</p>
          <button onClick={() => navigate('/search')}
            className="mt-4 text-blue-600 hover:underline text-sm">
            Search other flights
          </button>
        </div>
      </div>
    </div>
  )

  const price     = flight.price?.[cabin] || 0
  const total     = price * travelers
  const available = flight.seats?.[cabin === 'firstClass' ? 'firstClass' : cabin]?.available

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 flex-1">
        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to results
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Left column: flight info ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Header card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{flight.airline}</p>
                  <h1 className="text-xl font-bold text-gray-900">
                    {flight.from?.city} → {flight.to?.city}
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5">{formatDate(flight.departureTime)}</p>
                </div>
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <span className="text-blue-700 font-bold text-sm">{flight.airlineCode}</span>
                </div>
              </div>

              <FlightTimeline flight={flight} cabinClass={cabin} />
            </div>

            {/* Amenities & baggage */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4">Inclusions & Amenities</h2>
              <div className="flex flex-wrap gap-2">
                <InfoChip icon={Luggage}     label={`Cabin: ${flight.baggage?.cabin || '7 kg'}`} />
                <InfoChip icon={Luggage}     label={`Check-in: ${flight.baggage?.checkin || '15 kg'}`} />
                <InfoChip icon={Clock}       label={formatDuration(flight.duration)} />
                {flight.amenities?.meals && <InfoChip icon={Utensils} label="Meals included" />}
                {flight.amenities?.wifi   && <InfoChip icon={Wifi}     label="Wi-Fi available" />}
                {flight.refundable && (
                  <InfoChip icon={RefreshCcw} label="Refundable" />
                )}
                <InfoChip icon={ShieldCheck} label="Insured travel" />
              </div>

              {flight.refundable && (
                <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-3 text-xs text-green-700 flex items-start gap-2">
                  <RefreshCcw className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  Cancellation charge: ₹{flight.cancellationCharge || 500}. Free cancellation within 24 hours of booking.
                </div>
              )}
            </div>

            {/* Seat map toggle */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Seat Map Preview</h2>
                <button
                  onClick={() => setShowSeats(!showSeats)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showSeats ? 'Hide' : 'View seats'}
                </button>
              </div>
              {showSeats ? (
                <div className="overflow-x-auto">
                  <SeatMap cabinClass={cabin === 'firstClass' ? 'business' : cabin} maxSelectable={0} />
                  <p className="text-xs text-gray-400 text-center mt-3">
                    Select seats during the booking process
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-20 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-400">Click "View seats" to preview the cabin</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right column: booking panel ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20">
              <h2 className="font-bold text-gray-900 mb-4">Book This Flight</h2>

              {/* Cabin class */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Cabin class</p>
                <div className="flex flex-col gap-1.5">
                  {CABIN_OPTIONS.map((opt) => {
                    const optPrice = flight.price?.[opt.key] || 0
                    const optSeats = flight.seats?.[opt.key === 'firstClass' ? 'firstClass' : opt.key]?.available
                    if (!optPrice) return null
                    return (
                      <button
                        key={opt.key}
                        onClick={() => setCabin(opt.key)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all ${
                          cabin === opt.key
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <span className="font-medium">{opt.label}</span>
                        <span className="font-bold">₹{optPrice.toLocaleString()}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Travelers */}
              <div className="mb-5">
                <p className="text-xs font-medium text-gray-500 mb-2">Travelers</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTravelers(Math.max(1, travelers - 1))}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-semibold"
                  >−</button>
                  <span className="font-bold text-gray-900 text-lg w-6 text-center">{travelers}</span>
                  <button
                    onClick={() => setTravelers(Math.min(9, travelers + 1))}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-semibold"
                  >+</button>
                </div>
              </div>

              {/* Price summary */}
              <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">₹{price.toLocaleString()} × {travelers}</span>
                  <span className="font-medium text-gray-800">₹{(price * travelers).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Taxes & fees (5%)</span>
                  <span className="font-medium text-gray-800">₹{Math.round(total * 0.05).toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-1.5 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-blue-700 text-lg">
                    {formatCurrency(Math.round(total * 1.05))}
                  </span>
                </div>
              </div>

              {available !== undefined && available <= 5 && (
                <p className="text-xs text-red-500 font-medium mb-3 text-center">
                  ⚡ Only {available} seats left!
                </p>
              )}

              <button
                onClick={() => navigate(`/booking/${flight._id}?cabinClass=${cabin}&travelers=${travelers}`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm text-sm"
              >
                Book Now
              </button>

              <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-gray-400">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                Secure booking · No hidden charges
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default FlightDetailsPage
