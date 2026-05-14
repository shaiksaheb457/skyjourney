// pages/SearchResultsPage.jsx
import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, Plane, AlertCircle } from 'lucide-react'
import Navbar      from '../components/common/Navbar'
import Footer      from '../components/common/Footer'
import FlightCard  from '../components/flight/FlightCard'
import FlightFilter from '../components/flight/FlightFilter'
import SearchWidget from '../components/home/SearchWidget'
import { setFlights, setLoading, setError } from '../store/slices/flightSlice'
import { searchFlights } from '../services/flightService'

// Skeleton loader for individual flight card
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
    <div className="flex gap-4">
      <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
      <div className="w-24 space-y-2">
        <div className="h-6 bg-gray-200 rounded" />
        <div className="h-8 bg-gray-200 rounded-xl" />
      </div>
    </div>
  </div>
)

const SORT_OPTIONS = [
  { value:'cheapest',  label:'Cheapest' },
  { value:'fastest',   label:'Fastest' },
  { value:'departure', label:'Earliest' },
]

const SearchResultsPage = () => {
  const dispatch      = useDispatch()
  const navigate      = useNavigate()
  const [searchParams]= useSearchParams()

  const { flights, isLoading, totalResults } = useSelector(s => s.flights)

  const from          = searchParams.get('from')          || ''
  const to            = searchParams.get('to')            || ''
  const departureDate = searchParams.get('departureDate') || ''
  const travelers     = parseInt(searchParams.get('travelers') || '1')
  const cabinClass    = searchParams.get('cabinClass')    || 'economy'

  const [sortBy, setSortBy]       = useState('cheapest')
  const [showSearch, setShowSearch] = useState(false)
  const [filters, setFilters]     = useState({ maxPrice: 100000, airlines: [], stops: [], departureTime: [] })

  // Fetch flights on mount / when search params change
  useEffect(() => {
    const fetchFlights = async () => {
      if (!from || !to || !departureDate) return
      dispatch(setLoading(true))
      try {
        const data = await searchFlights({ from, to, departureDate, travelers, cabinClass, sortBy })
        dispatch(setFlights({ flights: data.data.flights, total: data.data.total }))
      } catch (err) {
        dispatch(setError(err.message))
      } finally {
        dispatch(setLoading(false))
      }
    }
    fetchFlights()
  }, [from, to, departureDate, travelers, cabinClass, sortBy])

  // Client-side filtering
  const filteredFlights = useMemo(() => {
    let result = [...flights]
    if (filters.maxPrice < 100000) result = result.filter(f => (f.price?.[cabinClass] || 0) <= filters.maxPrice)
    if (filters.airlines.length)   result = result.filter(f => filters.airlines.includes(f.airline))
    if (filters.stops.length)      result = result.filter(f => filters.stops.includes(f.stops))
    return result
  }, [flights, filters, cabinClass])

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' }) : ''

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Search summary bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <ArrowLeft className="w-4 h-4 text-gray-600" />
              </button>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-bold text-gray-900">{from}</span>
                <Plane className="w-4 h-4 text-blue-500" />
                <span className="text-lg font-bold text-gray-900">{to}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-600 text-sm">{formatDate(departureDate)}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-600 text-sm capitalize">{travelers} traveler · {cabinClass}</span>
              </div>
            </div>
            <button onClick={() => setShowSearch(!showSearch)}
              className="text-blue-600 text-sm font-semibold border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-all">
              {showSearch ? 'Hide Search ▲' : 'Modify Search ▼'}
            </button>
          </div>

          {showSearch && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <SearchWidget variant="compact" />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="flex gap-6">
          {/* Filters sidebar */}
          <FlightFilter filters={filters} onChange={(update) => setFilters(prev => ({ ...prev, ...update }))}
            onReset={() => setFilters({ maxPrice: 100000, airlines: [], stops: [], departureTime: [] })}
            totalResults={filteredFlights.length} />

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <p className="text-sm text-gray-600">
                {isLoading ? 'Searching flights...' : (
                  filteredFlights.length > 0
                    ? <><span className="font-semibold text-gray-900">{filteredFlights.length} flights</span> found for {from} → {to}</>
                    : 'No flights found'
                )}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <div className="flex gap-1">
                  {SORT_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setSortBy(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${sortBy === opt.value ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Loading skeletons */}
            {isLoading && (
              <div className="space-y-3">
                {Array.from({length:5}).map((_,i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {/* No results */}
            {!isLoading && filteredFlights.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="text-6xl mb-4">✈️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No flights found</h3>
                <p className="text-gray-500 mb-6">Try changing your filters or search for a different date</p>
                <button onClick={() => setFilters({ maxPrice: 100000, airlines: [], stops: [], departureTime: [] })}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all">
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Flight cards */}
            {!isLoading && filteredFlights.length > 0 && (
              <div className="space-y-3">
                {filteredFlights.map(flight => (
                  <FlightCard key={flight._id} flight={flight} cabinClass={cabinClass} travelers={travelers} />
                ))}
              </div>
            )}

            {/* Demo note when no flights in DB yet */}
            {!isLoading && flights.length === 0 && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">No flights in database yet</p>
                  <p className="text-sm text-amber-700 mt-0.5">Add test flights via the Admin panel or Postman: <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">POST /api/admin/flights</code></p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default SearchResultsPage
