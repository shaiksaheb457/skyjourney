// components/flight/FlightCard.jsx
import { useNavigate } from 'react-router-dom'
import { Clock, Wifi, Utensils, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

const AIRLINE_COLORS = {
  IndiGo:'bg-blue-100 text-blue-700', 'Air India':'bg-red-100 text-red-700',
  SpiceJet:'bg-red-100 text-red-700', Vistara:'bg-purple-100 text-purple-700',
  GoAir:'bg-green-100 text-green-700', default:'bg-gray-100 text-gray-700',
}

const formatTime = (dateStr) => {
  if (!dateStr) return '--:--'
  return new Date(dateStr).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:false })
}
const formatDuration = (mins) => {
  if (!mins) return '--'
  return `${Math.floor(mins/60)}h ${mins%60}m`
}

const FlightCard = ({ flight, cabinClass = 'economy', travelers = 1 }) => {
  const navigate    = useNavigate()
  const [expanded, setExpanded] = useState(false)

  const price        = flight.price?.[cabinClass] || 0
  const totalPrice   = price * travelers
  const colorClass   = AIRLINE_COLORS[flight.airline] || AIRLINE_COLORS.default
  const available    = flight.seats?.[cabinClass]?.available || 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">

          {/* Airline badge */}
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${colorClass}`}>
              {flight.airlineCode || flight.airline?.slice(0,2).toUpperCase()}
            </div>
            <p className="text-xs text-gray-500 text-center mt-1 max-w-[48px] truncate">{flight.airline}</p>
          </div>

          {/* Flight timeline */}
          <div className="flex-1 flex items-center gap-3 min-w-0">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatTime(flight.departureTime)}</p>
              <p className="text-sm font-semibold text-gray-700">{flight.from?.airportCode}</p>
              <p className="text-xs text-gray-400">{flight.from?.city}</p>
            </div>

            <div className="flex-1 flex flex-col items-center px-2">
              <p className="text-xs text-gray-400 mb-1">{formatDuration(flight.duration)}</p>
              <div className="w-full flex items-center gap-1">
                <div className="flex-1 h-px bg-gray-300" />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                {flight.stops > 0 && Array.from({length:flight.stops}).map((_,i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="h-1.5 w-6 bg-orange-400 rounded" />
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  </div>
                ))}
                <div className="flex-1 h-px bg-gray-300" />
              </div>
              <p className="text-xs text-center mt-1">
                {flight.stops === 0 ? (
                  <span className="text-green-600 font-medium">Non-stop</span>
                ) : (
                  <span className="text-orange-500 font-medium">{flight.stops} stop{flight.stops > 1 ? 's' : ''}</span>
                )}
              </p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatTime(flight.arrivalTime)}</p>
              <p className="text-sm font-semibold text-gray-700">{flight.to?.airportCode}</p>
              <p className="text-xs text-gray-400">{flight.to?.city}</p>
            </div>
          </div>

          {/* Price & book */}
          <div className="sm:text-right flex-shrink-0 w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-1">
            <div>
              <p className="text-2xl font-bold text-blue-700">₹{totalPrice.toLocaleString()}</p>
              {travelers > 1 && <p className="text-xs text-gray-400">₹{price.toLocaleString()} per person</p>}
              <p className="text-xs text-gray-400 capitalize">{cabinClass}</p>
            </div>
            <div>
              {available <= 5 && available > 0 && (
                <p className="text-xs text-red-500 font-medium mb-1">Only {available} seats left!</p>
              )}
              <button onClick={() => navigate(`/booking/${flight._id}?cabinClass=${cabinClass}&travelers=${travelers}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm shadow-sm whitespace-nowrap">
                Book Now
              </button>
            </div>
          </div>
        </div>

        {/* Amenities row */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
          <span className="text-xs text-gray-400">Flight {flight.flightNumber}</span>
          <span className="text-xs text-gray-400">Baggage: {flight.baggage?.checkin}</span>
          {flight.amenities?.meals && <span className="flex items-center gap-1 text-xs text-gray-400"><Utensils className="w-3 h-3" /> Meal</span>}
          {flight.amenities?.wifi  && <span className="flex items-center gap-1 text-xs text-gray-400"><Wifi className="w-3 h-3" /> WiFi</span>}
          {flight.refundable && <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">Refundable</span>}
          <button onClick={() => setExpanded(!expanded)} className="ml-auto flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
            {expanded ? <><ChevronUp className="w-3 h-3" />Less</> : <><ChevronDown className="w-3 h-3" />Details</>}
          </button>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label:'Cabin Baggage',   value: flight.baggage?.cabin || '7 kg' },
              { label:'Check-in Baggage',value: flight.baggage?.checkin || '15 kg' },
              { label:'Cancellation',    value: flight.refundable ? `₹${flight.cancellationCharge || 500} charge` : 'Non-refundable' },
              { label:'Seat Type',       value: cabinClass === 'economy' ? 'Standard' : cabinClass === 'business' ? 'Business' : 'First Class' },
            ].map(d => (
              <div key={d.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-0.5">{d.label}</p>
                <p className="text-sm font-semibold text-gray-800">{d.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FlightCard
