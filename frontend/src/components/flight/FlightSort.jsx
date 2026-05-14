// components/flight/FlightSort.jsx — Sort options bar for search results
import { useDispatch, useSelector } from 'react-redux'
import { setSortBy } from '../../store/slices/flightSlice'
import { ArrowUpDown, Zap, Clock, Sunrise, Sunset } from 'lucide-react'

const SORT_OPTIONS = [
  { key: 'cheapest', label: 'Cheapest',  icon: ArrowUpDown },
  { key: 'fastest',  label: 'Fastest',   icon: Zap          },
  { key: 'earliest', label: 'Earliest',  icon: Sunrise      },
  { key: 'latest',   label: 'Latest',    icon: Sunset       },
]

const FlightSort = ({ totalResults = 0 }) => {
  const dispatch = useDispatch()
  const sortBy   = useSelector((state) => state.flights.sortBy)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Result count */}
      <p className="text-sm text-gray-500 flex-1">
        <span className="font-semibold text-gray-800">{totalResults}</span> flight{totalResults !== 1 ? 's' : ''} found
      </p>

      {/* Sort tabs */}
      <div className="flex items-center gap-1 overflow-x-auto">
        <span className="text-xs text-gray-400 mr-1 whitespace-nowrap flex-shrink-0">Sort by:</span>
        {SORT_OPTIONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => dispatch(setSortBy(key))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              sortBy === key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default FlightSort
