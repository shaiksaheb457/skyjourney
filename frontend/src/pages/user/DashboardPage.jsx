// pages/user/DashboardPage.jsx
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Plane, CreditCard, Clock, User, ChevronRight, Download } from 'lucide-react'
import Navbar  from '../../components/common/Navbar'
import Footer  from '../../components/common/Footer'
import { getMyBookings } from '../../services/bookingService'
import { generateETicketPDF } from '../../utils/pdfGenerator'
import { selectUser } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '--'
const formatTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:false}) : '--'

const STATUS_COLORS = {
  confirmed:'bg-green-100 text-green-700',
  pending:  'bg-yellow-100 text-yellow-700',
  cancelled:'bg-red-100 text-red-700',
  completed:'bg-blue-100 text-blue-700',
}

const DashboardPage = () => {
  const user      = useSelector(selectUser)
  const navigate  = useNavigate()
  const [bookings, setBookings]   = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getMyBookings()
        setBookings(data.data.bookings || [])
      } catch { toast.error('Failed to load bookings') }
      finally { setIsLoading(false) }
    }
    fetch()
  }, [])

  const upcoming  = bookings.filter(b => b.status === 'confirmed' && new Date(b.flightId?.departureTime) > new Date())
  const totalSpent= bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + (b.pricing?.totalAmount||0), 0)

  const stats = [
    { label:'Total Bookings', value: bookings.length,    icon: Plane,       color:'bg-blue-50 text-blue-600' },
    { label:'Upcoming Trips', value: upcoming.length,    icon: Clock,       color:'bg-green-50 text-green-600' },
    { label:'Total Spent',    value:`₹${totalSpent.toLocaleString()}`, icon:CreditCard, color:'bg-purple-50 text-purple-600' },
  ]

  const quickLinks = [
    { label:'Search Flights',  path:'/search',       emoji:'🔍' },
    { label:'My Bookings',     path:'/my-bookings',  emoji:'📋' },
    { label:'Edit Profile',    path:'/profile',      emoji:'👤' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

        {/* Welcome banner */}
        <div className="rounded-2xl p-6 mb-6 text-white relative overflow-hidden" style={{background:'linear-gradient(135deg,#0f2645,#1565c0)'}}>
          <div className="absolute right-0 top-0 bottom-0 text-white/5 text-[180px] select-none leading-none">✈</div>
          <p className="text-blue-200 text-sm mb-1">Welcome back,</p>
          <h1 className="text-2xl font-bold mb-3">{user?.name} 👋</h1>
          <button onClick={() => navigate('/search')}
            className="bg-white/20 hover:bg-white/30 backdrop-blur border border-white/30 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all">
            Search Flights ✈️
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{isLoading ? '—' : s.value}</p>
                <p className="text-gray-500 text-sm">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent bookings */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Recent Bookings</h2>
              <Link to="/my-bookings" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({length:3}).map((_,i) => (
                  <div key={i} className="p-4 animate-pulse flex gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                    <div className="flex-1 space-y-2"><div className="h-3 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div>
                  </div>
                ))
              ) : bookings.slice(0,5).length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-3">✈️</div>
                  <p className="text-gray-500 text-sm">No bookings yet</p>
                  <button onClick={() => navigate('/search')} className="mt-3 text-blue-600 text-sm font-medium hover:underline">Book your first flight →</button>
                </div>
              ) : bookings.slice(0,5).map(b => {
                const flight = b.flightId || {}
                return (
                  <div key={b._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Plane className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{flight.from?.airportCode} → {flight.to?.airportCode}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[b.status]||'bg-gray-100 text-gray-600'}`}>{b.status}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(flight.departureTime)} · {formatTime(flight.departureTime)} · {b.pnr}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900">₹{(b.pricing?.totalAmount||0).toLocaleString()}</p>
                      {b.status === 'confirmed' && (
                        <button onClick={() => { generateETicketPDF(b); toast.success('Downloaded!') }}
                          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5 ml-auto mt-0.5">
                          <Download className="w-3 h-3" />Ticket
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* User card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <Link to="/profile" className="flex items-center justify-center gap-2 w-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-xl text-sm transition-all">
                <User className="w-4 h-4" /> Edit Profile
              </Link>
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Quick Actions</h3>
              <div className="space-y-2">
                {quickLinks.map(link => (
                  <Link key={link.path} to={link.path}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group">
                    <span className="text-lg">{link.emoji}</span>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 ml-auto" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default DashboardPage
