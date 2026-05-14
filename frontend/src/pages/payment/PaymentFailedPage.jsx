// pages/payment/PaymentFailedPage.jsx
import { useLocation, useNavigate } from 'react-router-dom'
import { XCircle, RefreshCw, Home, Headphones } from 'lucide-react'
import Navbar from '../../components/common/Navbar'

const PaymentFailedPage = () => {
  const location   = useLocation()
  const navigate   = useNavigate()
  const { bookingId } = location.state || {}

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-8 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                <XCircle className="w-9 h-9 text-red-500" />
              </div>
              <h1 className="text-white text-2xl font-bold">Payment Failed</h1>
              <p className="text-red-100 mt-1">Don't worry — your booking is saved</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-sm text-red-700 font-medium">Why did this happen?</p>
                <ul className="text-sm text-red-600 mt-2 space-y-1 list-disc list-inside">
                  <li>Insufficient account balance</li>
                  <li>Card declined by your bank</li>
                  <li>Payment session timed out</li>
                  <li>Network issue during payment</li>
                </ul>
              </div>

              <div className="space-y-3">
                <button onClick={() => navigate('/payment', { state: { bookingId } })}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all">
                  <RefreshCw className="w-4 h-4" /> Try Payment Again
                </button>
                <button onClick={() => navigate('/my-bookings')}
                  className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-all text-sm">
                  View My Bookings
                </button>
                <button onClick={() => navigate('/')}
                  className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 text-sm py-2">
                  <Home className="w-4 h-4" /> Back to Home
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-2">
                <Headphones className="w-4 h-4 text-blue-500" />
                <span>Need help? Call <strong>1800-123-4567</strong> (toll-free)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentFailedPage
