// pages/payment/PaymentPage.jsx — Razorpay integration
import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CreditCard, Shield, ArrowLeft, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar  from '../../components/common/Navbar'
import Footer  from '../../components/common/Footer'
import { createRazorpayOrder, verifyRazorpayPayment } from '../../services/bookingService'
import { selectUser } from '../../store/slices/authSlice'

// Load Razorpay script dynamically
const loadRazorpay = () => new Promise(resolve => {
  if (window.Razorpay) return resolve(true)
  const script    = document.createElement('script')
  script.src      = 'https://checkout.razorpay.com/v1/checkout.js'
  script.onload   = () => resolve(true)
  script.onerror  = () => resolve(false)
  document.body.appendChild(script)
})

const PaymentPage = () => {
  const location  = useLocation()
  const navigate  = useNavigate()
  const user      = useSelector(selectUser)

  const { bookingId, booking, flight } = location.state || {}

  const [isLoading, setIsLoading] = useState(false)
  const [rzpLoaded, setRzpLoaded] = useState(false)

  useEffect(() => {
    if (!bookingId) { navigate('/'); return }
    loadRazorpay().then(ok => {
      setRzpLoaded(ok)
      if (!ok) toast.error('Failed to load payment gateway')
    })
  }, [bookingId])

  const handleRazorpayPayment = async () => {
    if (!rzpLoaded) return toast.error('Payment gateway not loaded. Refresh and try again.')
    setIsLoading(true)

    try {
      // Step 1: Create order on backend
      const orderData = await createRazorpayOrder(bookingId)
      const { orderId, amount, keyId } = orderData.data

      // Step 2: Open Razorpay modal
      const options = {
        key:          keyId,
        amount:       amount,
        currency:     'INR',
        name:         'SkyJourney',
        description:  `Flight Booking — ${booking?.pnr}`,
        order_id:     orderId,
        prefill: {
          name:    user?.name  || '',
          email:   user?.email || '',
          contact: user?.phone || '',
        },
        theme:   { color: '#2563eb' },
        modal:   { ondismiss: () => { setIsLoading(false); toast('Payment cancelled') } },

        // Step 3: On success — verify on backend
        handler: async (response) => {
          try {
            const verifyData = await verifyRazorpayPayment({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              bookingId,
            })
            toast.success('Payment successful!')
            navigate('/payment/success', {
              state: { booking: verifyData.data.booking, payment: verifyData.data.payment }
            })
          } catch (err) {
            toast.error('Payment verification failed')
            navigate('/payment/failed', { state: { bookingId } })
          } finally { setIsLoading(false) }
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', () => {
        setIsLoading(false)
        toast.error('Payment failed. Please try again.')
        navigate('/payment/failed', { state: { bookingId } })
      })
      rzp.open()

    } catch (err) {
      setIsLoading(false)
      toast.error(err.response?.data?.message || 'Failed to initiate payment')
    }
  }

  if (!bookingId) return null

  const pricing = booking?.pricing || {}

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-5">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg">Complete Payment</h1>
                  <p className="text-blue-200 text-sm">PNR: {booking?.pnr}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Order summary */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Summary</h3>
                {[
                  {label:'Base Fare',  value: pricing.baseFare},
                  {label:'Taxes',      value: pricing.taxes},
                  {label:'Add-ons',    value: pricing.addOnsFee},
                  ...(pricing.discount > 0 ? [{label:'Discount', value: -pricing.discount}] : []),
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{row.label}</span>
                    <span className={row.value < 0 ? 'text-green-600 font-medium' : 'text-gray-700'}>
                      {row.value < 0 ? `-₹${Math.abs(row.value).toLocaleString()}` : `₹${(row.value||0).toLocaleString()}`}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-blue-700 text-lg">₹{(pricing.totalAmount||0).toLocaleString()}</span>
                </div>
              </div>

              {/* Payment methods */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Pay with Razorpay</h3>
                <div className="grid grid-cols-4 gap-2">
                  {['UPI','Cards','NetBanking','Wallet'].map(m => (
                    <div key={m} className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-center">
                      <p className="text-xs text-gray-600 font-medium">{m}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">All payment methods available via Razorpay</p>
              </div>

              {/* Pay button */}
              <button onClick={handleRazorpayPayment} disabled={isLoading || !rzpLoaded}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-base shadow-lg disabled:opacity-60">
                {isLoading ? (
                  <><Loader className="w-5 h-5 animate-spin" />Opening Payment Gateway...</>
                ) : (
                  <>🔒 Pay ₹{(pricing.totalAmount||0).toLocaleString()} Securely</>
                )}
              </button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 pt-1">
                {['256-bit SSL','PCI DSS','RBI Approved'].map(badge => (
                  <div key={badge} className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-gray-400">{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Test mode note */}
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs text-amber-700 font-medium">🧪 Test Mode</p>
            <p className="text-xs text-amber-600 mt-0.5">Use card: 4111 1111 1111 1111 | CVV: any 3 digits | Expiry: any future date</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default PaymentPage
