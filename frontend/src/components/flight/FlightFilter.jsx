// components/flight/FlightFilter.jsx
import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'

const AIRLINES = ['IndiGo','Air India','SpiceJet','Vistara','GoAir','AirAsia']
const STOP_OPTIONS = [{value:0,label:'Non-stop'},{value:1,label:'1 Stop'},{value:2,label:'2+ Stops'}]
const TIME_SLOTS = [
  {value:'early',  label:'Early Morning', sub:'12am – 8am'},
  {value:'morning',label:'Morning',       sub:'8am – 12pm'},
  {value:'afternoon',label:'Afternoon',   sub:'12pm – 6pm'},
  {value:'evening',label:'Evening',       sub:'6pm – 12am'},
]

const FlightFilter = ({ filters, onChange, onReset, totalResults }) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleAirline = (airline) => {
    const updated = filters.airlines.includes(airline)
      ? filters.airlines.filter(a => a !== airline)
      : [...filters.airlines, airline]
    onChange({ airlines: updated })
  }

  const toggleStop = (stop) => {
    const updated = filters.stops.includes(stop)
      ? filters.stops.filter(s => s !== stop)
      : [...filters.stops, stop]
    onChange({ stops: updated })
  }

  const toggleTime = (slot) => {
    const updated = filters.departureTime.includes(slot)
      ? filters.departureTime.filter(s => s !== slot)
      : [...filters.departureTime, slot]
    onChange({ departureTime: updated })
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-gray-900">Filters</h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{totalResults} flights</span>
        </div>
        <button onClick={onReset} className="text-xs text-red-500 hover:text-red-600 font-medium">Reset All</button>
      </div>

      {/* Price range */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Max Price</h4>
        <input type="range" min={500} max={100000} step={500} value={filters.maxPrice}
          onChange={e => onChange({ maxPrice: parseInt(e.target.value) })}
          className="w-full accent-blue-600" />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">₹500</span>
          <span className="text-sm font-semibold text-blue-700">₹{filters.maxPrice.toLocaleString()}</span>
          <span className="text-xs text-gray-500">₹1,00,000</span>
        </div>
      </div>

      {/* Stops */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Stops</h4>
        <div className="space-y-2">
          {STOP_OPTIONS.map(opt => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" checked={filters.stops.includes(opt.value)}
                onChange={() => toggleStop(opt.value)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 accent-blue-600 cursor-pointer" />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Departure time */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Departure Time</h4>
        <div className="grid grid-cols-2 gap-2">
          {TIME_SLOTS.map(slot => (
            <button key={slot.value} onClick={() => toggleTime(slot.value)}
              className={`p-2.5 rounded-xl border text-left transition-all ${filters.departureTime.includes(slot.value) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-200 text-gray-600'}`}>
              <p className="text-xs font-semibold">{slot.label}</p>
              <p className="text-xs opacity-70">{slot.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Airlines */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Airlines</h4>
        <div className="space-y-2">
          {AIRLINES.map(airline => (
            <label key={airline} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" checked={filters.airlines.includes(airline)}
                onChange={() => toggleAirline(airline)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 accent-blue-600 cursor-pointer" />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{airline}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile filter button */}
      <button onClick={() => setMobileOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700">
        <SlidersHorizontal className="w-4 h-4" /> Filters
      </button>

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
          <FilterContent />
        </div>
      </div>

      {/* Mobile slide-over */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-xl hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <FilterContent />
            <button onClick={() => setMobileOpen(false)}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl">
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default FlightFilter
