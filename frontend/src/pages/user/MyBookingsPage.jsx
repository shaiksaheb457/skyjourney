// pages/user/MyBookingsPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, X, ChevronDown, ChevronUp, Plane, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar  from '../../components/common/Navbar'
import Footer  from '../../components/common/Footer'
import { getMyBookings, cancelBooking } from '../../services/bookingService'
import { generateETicketPDF } from '../../utils/pdfGenerator'

const STATUS_CONFIG = {
  confirmed: { label:'Confirmed',  icon: CheckCircle, color:'text-green-600',  bg:'bg-green-50',  border:'border-green-200' },
  pending:   { label:'Pending',    icon: Clock,       color:'text-yellow-600', bg:'bg-yellow-50', border:'border-yellow-200' },
  cancelled: { label:'Cancelled',  icon: XCircle,     color:'text-red-600',    bg:'bg-red-50',    border:'border-red-200' },
  completed: { label:'Completed',  icon: CheckCircle, color:'text-blue-600',   bg:'bg-blue-50',   border:'border-blue-200' },
  refunded:  { label:'Refunded',   icon: AlertCircle, color:'text-purple-600', bg:'bg-purple-50', border:'border-purple-200' },
}

const formatTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:false}) : '--'
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'}) : '--'
const formatDur  = (m) => m ? `${Math.floor(m/60)}h ${m%60}m` : '--'

const BookingCard = ({ booking, onCancel, onDownload }) => {
  const [expanded, setExpanded] = useState(false)
  const flight  = booking.flightId || {}
  const pricing = booking.pricing  || {}
  const status  = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending
  const StatusIcon = status.icon
  const canCancel  = ['confirmed','pending'].includes(booking.status)

  return (
    <div className={`bg-white rounded-2xl border-2 ${status.border} shadow-sm overflow-hidden transition-all`}>
      {/* Header */}
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: flight info */}
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Plane className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-bold text-gray-900">{flight.from?.airportCode}</span>
                <Plane className="w-4 h-4 text-blue-400" />
                <span className="text-lg font-bold text-gray-900">{flight.to?.airportCode}</span>
                <span className="text-gray-400 text-sm">·</span>
                <span className="text-gray-500 text-sm">{flight.airline}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-sm text-gray-500">{formatDate(flight.departureTime)}</span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-500">{formatTime(flight.departureTime)} → {formatTime(flight.arrivalTime)}</span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-500 capitalize">{booking.cabinClass}</span>
              </div>
              <div className="mt-1.5">
                <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">{booking.pnr}</span>
              </div>
            </div>
          </div>

          {/* Right: status + price */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${status.bg}`}>
              <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
              <span className={`text-xs font-semibold ${status.color}`}>{status.label}</span>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">₹{(pricing.totalAmount||0).toLocaleString()}</p>
              <p className="text-xs text-gray-400">{booking.passengers?.length} passenger{booking.passengers?.length > 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
          {booking.status === 'confirmed' && (
            <button onClick={() => onDownload(booking)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all">
              <Download className="w-3.5 h-3.5" /> Download Ticket
            </button>
          )}
          {canCancel && (
            <button onClick={() => onCancel(booking)}
              className="flex items-center gap-1.5 px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 text-sm font-semibold rounded-xl transition-all">
              <X className="w-3.5 h-3.5" /> Cancel Booking
            </button>
          )}
          {booking.status === 'cancelled' && booking.refundAmount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 rounded-xl">
              <span className="text-xs text-purple-700 font-medium">Refund ₹{booking.refundAmount.toLocaleString()} — {booking.refundStatus}</span>
            </div>
          )}
          <button onClick={() => setExpanded(!expanded)} className="ml-auto flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
            {expanded ? <><ChevronUp className="w-3.5 h-3.5" />Less</> : <><ChevronDown className="w-3.5 h-3.5" />Details</>}
          </button>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label:'Flight',    value: flight.flightNumber },
                { label:'Duration',  value: formatDur(flight.duration) },
                { label:'Stops',     value: flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop(s)` },
                { label:'Booked on', value: formatDate(booking.createdAt) },
              ].map(d => (
                <div key={d.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{d.label}</p>
                  <p className="text-sm font-semibold text-gray-800">{d.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Passengers</p>
              <div className="space-y-1.5">
                {booking.passengers?.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm bg-gray-50 rounded-xl px-3 py-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold">{i+1}</div>
                    <span className="font-medium text-gray-800">{p.name}</span>
                    <span className="text-gray-400 text-xs capitalize">{p.gender} · {p.age} yrs · {p.type}</span>
                    {p.meal !== 'none' && <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full capitalize">{p.meal}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const CancelModal = ({ booking, onConfirm, onClose, isLoading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40" onClick={onClose} />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
      <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <XCircle className="w-7 h-7 text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Cancel Booking?</h3>
      <p className="text-gray-500 text-sm text-center mb-1">PNR: <strong>{booking?.pnr}</strong></p>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 my-4 text-sm text-amber-700">
        <p className="font-medium mb-1">⚠ Cancellation Policy</p>
        <p>· More than 24hrs before: Full refund minus ₹500 charge</p>
        <p>· 4–24hrs before: 50% refund</p>
        <p>· Less than 4hrs before: No refund</p>
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-all">Keep Booking</button>
        <button onClick={onConfirm} disabled={isLoading}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2">
          {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Cancelling...</> : 'Yes, Cancel'}
        </button>
      </div>
    </div>
  </div>
)

const MyBookingsPage = () => {
  const navigate             = useNavigate()
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [cancelTarget, setCancelTarget] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)

  const TABS = [
    { key:'all',       label:'All Bookings' },
    { key:'confirmed', label:'Confirmed' },
    { key:'pending',   label:'Pending' },
    { key:'cancelled', label:'Cancelled' },
  ]

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

  const handleCancel = async () => {
    if (!cancelTarget) return
    setIsCancelling(true)
    try {
      const data = await cancelBooking(cancelTarget._id, 'Cancelled by user')
      setBookings(prev => prev.map(b => b._id === cancelTarget._id ? { ...b, status:'cancelled', refundAmount: data.data.refundAmount } : b))
      toast.success(`Booking cancelled. ${data.data.refundMessage}`)
      setCancelTarget(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking')
    } finally { setIsCancelling(false) }
  }

  const handleDownload = (booking) => {
    generateETicketPDF(booking)
    toast.success('Ticket downloaded!')
  }

  const filtered = activeTab === 'all' ? bookings : bookings.filter(b => b.status === activeTab)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-500 text-sm mt-1">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => navigate('/search')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all">
            + Book New Flight
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1 mb-6 shadow-sm overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.key ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab.label}
              {tab.key !== 'all' && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-white/20' : 'bg-gray-100'}`}>
                  {bookings.filter(b => b.status === tab.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="flex gap-4"><div className="w-12 h-12 bg-gray-200 rounded-xl" /><div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-4">✈️</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500 text-sm mb-5">
              {activeTab === 'all' ? "You haven't booked any flights yet" : `No ${activeTab} bookings`}
            </p>
            <button onClick={() => navigate('/search')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all">
              Search Flights
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(b => (
              <BookingCard key={b._id} booking={b} onCancel={setCancelTarget} onDownload={handleDownload} />
            ))}
          </div>
        )}
      </div>
      <Footer />
      {cancelTarget && <CancelModal booking={cancelTarget} onConfirm={handleCancel} onClose={() => setCancelTarget(null)} isLoading={isCancelling} />}
    </div>
  )
}

export default MyBookingsPage
