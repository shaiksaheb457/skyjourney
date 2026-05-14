// components/flight/FlightTimeline.jsx — Visual departure-to-arrival timeline
import { Plane } from 'lucide-react'
import { formatTime, formatDate, formatDuration } from '../../utils/formatters'

/**
 * FlightTimeline — horizontal timeline showing departure, stops, and arrival
 * Used inside FlightDetailsPage and the booking confirmation view
 */
const FlightTimeline = ({ flight, cabinClass = 'economy', compact = false }) => {
  if (!flight) return null

  const stops      = flight.stops || 0
  const stopCities = flight.stopCities || []

  return (
    <div className={`w-full ${compact ? '' : 'py-2'}`}>
      <div className="flex items-start gap-2">

        {/* Departure */}
        <div className={`text-center flex-shrink-0 ${compact ? 'min-w-[60px]' : 'min-w-[80px]'}`}>
          <p className={`font-bold text-gray-900 ${compact ? 'text-lg' : 'text-2xl'}`}>
            {formatTime(flight.departureTime)}
          </p>
          <p className={`font-semibold text-gray-700 ${compact ? 'text-xs' : 'text-sm'}`}>
            {flight.from?.airportCode}
          </p>
          <p className="text-xs text-gray-400 truncate max-w-[80px]">{flight.from?.city}</p>
          {!compact && (
            <p className="text-xs text-gray-300 mt-0.5">{formatDate(flight.departureTime)}</p>
          )}
        </div>

        {/* Timeline track */}
        <div className="flex-1 flex flex-col items-center pt-2 px-2 min-w-0">
          <p className="text-xs text-gray-400 mb-2">{formatDuration(flight.duration)}</p>

          <div className="w-full flex items-center">
            {/* Departure dot */}
            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />

            {stops === 0 ? (
              /* Non-stop line with plane icon */
              <>
                <div className="flex-1 h-px bg-gray-300 mx-1" />
                <Plane className="w-4 h-4 text-blue-500 flex-shrink-0 rotate-0" />
                <div className="flex-1 h-px bg-gray-300 mx-1" />
              </>
            ) : (
              /* Stops */
              Array.from({ length: stops }).map((_, i) => (
                <div key={i} className="flex-1 flex items-center">
                  <div className="flex-1 h-px bg-gray-300 mx-1" />
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-400 border-2 border-white shadow-sm flex-shrink-0" />
                    {stopCities[i] && (
                      <p className="text-[10px] text-orange-500 font-medium mt-0.5 whitespace-nowrap">
                        {stopCities[i]}
                      </p>
                    )}
                  </div>
                  <div className="flex-1 h-px bg-gray-300 mx-1" />
                </div>
              ))
            )}

            {/* Arrival dot */}
            <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          </div>

          {/* Stop label */}
          <p className={`text-xs mt-1.5 font-medium ${stops === 0 ? 'text-green-600' : 'text-orange-500'}`}>
            {stops === 0 ? 'Non-stop' : `${stops} stop${stops > 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Arrival */}
        <div className={`text-center flex-shrink-0 ${compact ? 'min-w-[60px]' : 'min-w-[80px]'}`}>
          <p className={`font-bold text-gray-900 ${compact ? 'text-lg' : 'text-2xl'}`}>
            {formatTime(flight.arrivalTime)}
          </p>
          <p className={`font-semibold text-gray-700 ${compact ? 'text-xs' : 'text-sm'}`}>
            {flight.to?.airportCode}
          </p>
          <p className="text-xs text-gray-400 truncate max-w-[80px]">{flight.to?.city}</p>
          {!compact && (
            <p className="text-xs text-gray-300 mt-0.5">{formatDate(flight.arrivalTime)}</p>
          )}
        </div>
      </div>

      {/* Cabin class & flight number */}
      {!compact && (
        <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-gray-50">
          <span className="text-xs text-gray-400">
            ✈ {flight.airline} · {flight.flightNumber}
          </span>
          <span className="text-xs text-gray-400 capitalize">
            {cabinClass === 'firstClass' ? 'First Class' : cabinClass}
          </span>
          <span className="text-xs text-gray-400">
            Baggage: {flight.baggage?.checkin || '15 kg'}
          </span>
        </div>
      )}
    </div>
  )
}

export default FlightTimeline
