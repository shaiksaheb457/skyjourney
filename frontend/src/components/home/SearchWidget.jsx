// components/home/SearchWidget.jsx — Flight search form
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { MapPin, Calendar, Users, ChevronDown, ArrowRightLeft, Search } from 'lucide-react'
import { setSearchParams } from '../../store/slices/flightSlice'
import toast from 'react-hot-toast'

const AIRPORTS = [
  { code:'DEL', city:'Delhi',     name:'Indira Gandhi Intl' },
  { code:'BOM', city:'Mumbai',    name:'Chhatrapati Shivaji Intl' },
  { code:'BLR', city:'Bangalore', name:'Kempegowda Intl' },
  { code:'HYD', city:'Hyderabad', name:'Rajiv Gandhi Intl' },
  { code:'MAA', city:'Chennai',   name:'Chennai Intl' },
  { code:'CCU', city:'Kolkata',   name:'Netaji Subhas Chandra Bose' },
  { code:'GOI', city:'Goa',       name:'Goa Intl Airport' },
  { code:'PNQ', city:'Pune',      name:'Pune Airport' },
  { code:'AMD', city:'Ahmedabad', name:'Sardar Vallabhbhai Patel' },
  { code:'JAI', city:'Jaipur',    name:'Jaipur Intl Airport' },
  { code:'DXB', city:'Dubai',     name:'Dubai Intl Airport' },
  { code:'SIN', city:'Singapore', name:'Changi Airport' },
  { code:'BKK', city:'Bangkok',   name:'Suvarnabhumi Airport' },
  { code:'LHR', city:'London',    name:'Heathrow Airport' },
]

const AirportInput = ({ label, value, onChange, placeholder, icon: Icon }) => {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')

  const filtered = AIRPORTS.filter(a =>
    a.city.toLowerCase().includes(query.toLowerCase()) ||
    a.code.toLowerCase().includes(query.toLowerCase())
  )

  const selected = AIRPORTS.find(a => a.code === value)

  return (
    <div className="relative flex-1 min-w-0">
      <div className="flex items-center gap-2 px-4 py-3 cursor-pointer" onClick={() => { setOpen(true); setQuery('') }}>
        <Icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-500 mb-0.5">{label}</p>
          {selected ? (
            <div>
              <p className="text-base font-bold text-gray-900 leading-none">{selected.code}</p>
              <p className="text-xs text-gray-500 truncate">{selected.city}</p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">{placeholder}</p>
          )}
        </div>
      </div>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
            <div className="p-3 border-b border-gray-100">
              <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search city or airport..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filtered.map(a => (
                <button key={a.code} onClick={() => { onChange(a.code); setOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 text-xs font-bold">{a.code}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{a.city}</p>
                    <p className="text-xs text-gray-500">{a.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const SearchWidget = ({ variant = 'hero' }) => {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()

  const [tripType, setTripType]           = useState('one-way')
  const [from, setFrom]                   = useState('')
  const [to, setTo]                       = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [returnDate, setReturnDate]       = useState('')
  const [travelers, setTravelers]         = useState(1)
  const [cabinClass, setCabinClass]       = useState('economy')
  const [showTravelers, setShowTravelers] = useState(false)

  const swapAirports = () => { const tmp = from; setFrom(to); setTo(tmp) }

  const handleSearch = () => {
    if (!from)          return toast.error('Please select departure city')
    if (!to)            return toast.error('Please select destination city')
    if (from === to)    return toast.error('From and To cannot be the same')
    if (!departureDate) return toast.error('Please select departure date')

    const params = { from, to, departureDate, returnDate, travelers, cabinClass, tripType }
    dispatch(setSearchParams(params))

    const qs = new URLSearchParams({
      from, to, departureDate, travelers: travelers.toString(), cabinClass, tripType,
      ...(returnDate && { returnDate }),
    }).toString()
    navigate(`/search?${qs}`)
  }

  const today = new Date().toISOString().split('T')[0]

  const isHero = variant === 'hero'

  return (
    <div className={isHero ? 'w-full' : 'bg-white rounded-2xl shadow-md border border-gray-100 p-4'}>
      {/* Trip type tabs */}
      <div className="flex gap-1 mb-4">
        {['one-way','round-trip'].map(type => (
          <button key={type} onClick={() => setTripType(type)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${tripType === type ? (isHero ? 'bg-white text-blue-700' : 'bg-blue-600 text-white') : (isHero ? 'text-white/80 hover:bg-white/20' : 'text-gray-500 hover:bg-gray-100')}`}>
            {type === 'one-way' ? 'One Way' : 'Round Trip'}
          </button>
        ))}
      </div>

      {/* Main search row */}
      <div className={`${isHero ? 'bg-white' : 'bg-gray-50 border border-gray-200'} rounded-2xl overflow-visible`}>
        <div className="flex flex-col lg:flex-row">
          {/* From */}
          <AirportInput label="From" value={from} onChange={setFrom} placeholder="Departure city" icon={MapPin} />

          {/* Swap button */}
          <div className="hidden lg:flex items-center justify-center px-2 relative z-10">
            <button onClick={swapAirports}
              className="w-9 h-9 bg-blue-50 hover:bg-blue-100 border-2 border-white rounded-full flex items-center justify-center transition-all shadow-sm">
              <ArrowRightLeft className="w-4 h-4 text-blue-600" />
            </button>
          </div>

          {/* To */}
          <div className="border-t lg:border-t-0 lg:border-l border-gray-100">
            <AirportInput label="To" value={to} onChange={setTo} placeholder="Destination city" icon={MapPin} />
          </div>

          {/* Departure date */}
          <div className="border-t lg:border-t-0 lg:border-l border-gray-100 flex items-center gap-2 px-4 py-3 min-w-0">
            <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">Departure</p>
              <input type="date" value={departureDate} min={today} onChange={e => setDepartureDate(e.target.value)}
                className="text-sm font-semibold text-gray-900 bg-transparent focus:outline-none w-full cursor-pointer" />
            </div>
          </div>

          {/* Return date */}
          {tripType === 'round-trip' && (
            <div className="border-t lg:border-t-0 lg:border-l border-gray-100 flex items-center gap-2 px-4 py-3">
              <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Return</p>
                <input type="date" value={returnDate} min={departureDate || today} onChange={e => setReturnDate(e.target.value)}
                  className="text-sm font-semibold text-gray-900 bg-transparent focus:outline-none cursor-pointer" />
              </div>
            </div>
          )}

          {/* Travelers + Class */}
          <div className="border-t lg:border-t-0 lg:border-l border-gray-100 relative">
            <div className="flex items-center gap-2 px-4 py-3 cursor-pointer" onClick={() => setShowTravelers(!showTravelers)}>
              <Users className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Travelers & Class</p>
                <p className="text-sm font-semibold text-gray-900 capitalize">{travelers} Traveler · {cabinClass}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showTravelers ? 'rotate-180' : ''}`} />
            </div>
            {showTravelers && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowTravelers(false)} />
                <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">Travelers</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setTravelers(Math.max(1, travelers - 1))} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold">−</button>
                      <span className="text-sm font-semibold w-4 text-center">{travelers}</span>
                      <button onClick={() => setTravelers(Math.min(9, travelers + 1))} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold">+</button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Cabin Class</p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {['economy','business','firstClass'].map(c => (
                        <button key={c} onClick={() => setCabinClass(c)}
                          className={`px-3 py-2 rounded-xl text-sm font-medium transition-all text-left capitalize ${cabinClass === c ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                          {c === 'firstClass' ? 'First Class' : c.charAt(0).toUpperCase() + c.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search button */}
      <div className="flex justify-center mt-4">
        <button onClick={handleSearch}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold px-10 py-4 rounded-2xl transition-all shadow-lg shadow-orange-200 text-base">
          <Search className="w-5 h-5" />
          Search Flights
        </button>
      </div>
    </div>
  )
}

export default SearchWidget
