// components/home/PopularDestinations.jsx
import { useNavigate } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'

const destinations = [
  { city:'Dubai',     country:'UAE',        code:'DXB', price:12500, emoji:'🏙️', bg:'from-amber-400 to-orange-500' },
  { city:'Bangkok',   country:'Thailand',   code:'BKK', price:15800, emoji:'🛕', bg:'from-emerald-400 to-teal-500' },
  { city:'Singapore', country:'Singapore',  code:'SIN', price:18200, emoji:'🦁', bg:'from-red-400 to-rose-500' },
  { city:'Mumbai',    country:'India',      code:'BOM', price:3500,  emoji:'🌊', bg:'from-blue-400 to-blue-600' },
  { city:'Goa',       country:'India',      code:'GOI', price:2800,  emoji:'🏖️', bg:'from-yellow-400 to-amber-500' },
  { city:'London',    country:'UK',         code:'LHR', price:45000, emoji:'🎡', bg:'from-purple-400 to-violet-600' },
  { city:'Bali',      country:'Indonesia',  code:'DPS', price:22000, emoji:'🌴', bg:'from-green-400 to-emerald-600' },
  { city:'Paris',     country:'France',     code:'CDG', price:48000, emoji:'🗼', bg:'from-pink-400 to-rose-600' },
]

const PopularDestinations = () => {
  const navigate  = useNavigate()
  const today     = new Date().toISOString().split('T')[0]

  const handleClick = (dest) => {
    navigate(`/search?from=DEL&to=${dest.code}&departureDate=${today}&travelers=1&cabinClass=economy`)
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-blue-600 text-sm font-semibold uppercase tracking-wider">Trending Now</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Popular Destinations</h2>
            <p className="text-gray-500 mt-1">Handpicked destinations with the best deals</p>
          </div>
          <button className="hidden sm:block text-blue-600 font-semibold text-sm hover:text-blue-700 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-all">
            View All →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {destinations.map((dest, i) => (
            <button key={dest.code} onClick={() => handleClick(dest)}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] cursor-pointer text-left">
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${dest.bg} group-hover:scale-105 transition-transform duration-300`} />
              {/* Emoji */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl opacity-60 group-hover:opacity-80 transition-opacity">{dest.emoji}</span>
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              {/* Text */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white font-bold text-sm">{dest.city}</p>
                <p className="text-white/75 text-xs">{dest.country}</p>
                <p className="text-white font-semibold text-xs mt-1">from ₹{dest.price.toLocaleString()}</p>
              </div>
              {/* Badge for first 2 */}
              {i < 2 && (
                <div className="absolute top-2.5 right-2.5 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">HOT</div>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PopularDestinations
