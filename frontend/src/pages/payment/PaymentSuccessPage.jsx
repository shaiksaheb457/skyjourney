// pages/payment/PaymentSuccessPage.jsx
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, Download, Home, List, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import Navbar  from '../../components/common/Navbar'
import { generateETicketPDF } from '../../utils/pdfGenerator'
import toast from 'react-hot-toast'

const Confetti = () => {
  const colors = ['#2563eb','#f59e0b','#10b981','#ef4444','#8b5cf6','#f97316']
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({length:40}).map((_,i) => (
        <div key={i} style={{
          position:'absolute', left:`${Math.random()*100}%`,
          top:`${-10 - Math.random()*10}%`,
          width:`${6+Math.random()*6}px`, height:`${6+Math.random()*6}px`,
          background: colors[Math.floor(Math.random()*colors.length)],
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          animation:`fall ${2+Math.random()*3}s linear ${Math.random()*2}s forwards`,
        }} />
      ))}
      <style>{`@keyframes fall{to{transform:translateY(110vh) rotate(720deg);opacity:0}}`}</style>
    </div>
  )
}

const PaymentSuccessPage = () => {
  const location    = useLocation()
  const navigate    = useNavigate()
  const [showConfetti, setShowConfetti] = useState(true)
  const { booking, payment } = location.state || {}

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 4000)
    return () => clearTimeout(t)
  }, [])

  const handleDownloadTicket = () => {
    if (!booking) return toast.error('Booking data not available')
    generateETicketPDF(booking)
    toast.success('Ticket downloaded!')
  }

  if (!booking) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500">Booking details not found</p>
        <button onClick={() => navigate('/')} className="mt-3 text-blue-600 hover:underline">Go Home</button>
      </div>
    </div>
  )

  const flight  = booking.flightId || {}
  const pricing = booking.pricing  || {}
  const formatT = (d) => d ? new Date(d).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:false}) : '--'
  const formatD = (d) => d ? new Date(d).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'long',year:'numeric'}) : '--'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showConfetti && <Confetti />}
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          {/* Success card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Green header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-9 h-9 text-green-500" />
              </div>
              <h1 className="text-white text-2xl font-bold">Booking Confirmed!</h1>
              <p className="text-green-100 mt-1">Your flight is booked. Have a great journey!</p>
            </div>

            <div className="p-6 space-y-5">
              {/* PNR */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                <p className="text-blue-600 text-xs font-semibold uppercase tracking-wider mb-1">Booking Reference (PNR)</p>
                <p className="text-3xl font-bold text-blue-800 tracking-widest">{booking.pnr}</p>
                <p className="text-blue-500 text-xs mt-1">Save this for check-in</p>
              </div>

              {/* Flight details */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{flight.from?.airportCode}</p>
                    <p className="text-xs text-gray-500">{flight.from?.city}</p>
                    <p className="text-sm font-semibold text-gray-700 mt-1">{formatT(flight.departureTime)}</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center px-3">
                    <p className="text-xs text-gray-400">{flight.airline}</p>
                    <div className="w-full flex items-center gap-1 my-1">
                      <div className="flex-1 h-px bg-gray-300" />
                      <span className="text-blue-500">✈</span>
                      <div className="flex-1 h-px bg-gray-300" />
                    </div>
                    <p className="text-xs text-gray-400">{flight.flightNumber}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{flight.to?.airportCode}</p>
                    <p className="text-xs text-gray-500">{flight.to?.city}</p>
                    <p className="text-sm font-semibold text-gray-700 mt-1">{formatT(flight.arrivalTime)}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">{formatD(flight.departureTime)}</p>
              </div>

              {/* Amount paid */}
              <div className="flex justify-between items-center bg-green-50 rounded-xl px-4 py-3">
                <span className="text-sm font-semibold text-gray-700">Total Paid</span>
                <span className="text-xl font-bold text-green-700">₹{(pricing.totalAmount||0).toLocaleString()}</span>
              </div>

              {/* Passengers count */}
              <p className="text-sm text-gray-500 text-center">
                {booking.passengers?.length} passenger{booking.passengers?.length > 1 ? 's' : ''} · {booking.cabinClass} class
              </p>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleDownloadTicket}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all text-sm">
                  <Download className="w-4 h-4" /> Download Ticket
                </button>
                <button onClick={() => navigate('/my-bookings')}
                  className="flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-all text-sm">
                  <List className="w-4 h-4" /> My Bookings
                </button>
              </div>

              <button onClick={() => navigate('/')}
                className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 text-sm py-2">
                <Home className="w-4 h-4" /> Back to Homepage
              </button>
            </div>
          </div>

          {/* Email note */}
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
            <p className="text-sm text-blue-700">📧 Booking confirmation sent to <strong>{booking.userId?.email}</strong></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccessPage
