// components/booking/PriceSummary.jsx
import { Tag, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { useState } from 'react'

const PriceSummary = ({ flight, passengers, addOns, coupon, cabinClass = 'economy', onProceed, isLoading }) => {
  const [showBreakdown, setShowBreakdown] = useState(false)
  const numP      = passengers?.length || 1
  const basePerP  = flight?.price?.[cabinClass] || 0
  const baseFare  = basePerP * numP
  const taxes     = Math.round(baseFare * 0.05)
  const addOnsFee = (addOns?.travelInsurance?.enabled ? 299 : 0) + (addOns?.priorityBoarding?.enabled ? 199 : 0)
  const discount  = coupon?.discount || 0
  const total     = baseFare + taxes + addOnsFee - discount

  const rows = [
    { label:`Base Fare (${numP} × ₹${basePerP.toLocaleString()})`, value: baseFare,   color:'text-gray-700' },
    { label:'Taxes & Fees (5% GST)',                                value: taxes,      color:'text-gray-700' },
    ...(addOnsFee > 0 ? [{ label:'Add-ons',                         value: addOnsFee,  color:'text-gray-700' }] : []),
    ...(discount  > 0 ? [{ label:`Discount (${coupon.code})`,       value: -discount,  color:'text-green-600' }] : []),
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4">
        <h3 className="text-white font-bold text-base">Price Summary</h3>
        <p className="text-blue-200 text-xs mt-0.5 capitalize">{numP} traveler · {cabinClass}</p>
      </div>

      {/* Flight info */}
      <div className="px-5 py-4 border-b border-gray-100 bg-blue-50">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{flight?.from?.airportCode}</p>
            <p className="text-xs text-gray-500">{flight?.from?.city}</p>
          </div>
          <div className="flex-1 flex flex-col items-center px-3">
            <p className="text-xs text-gray-400">{flight?.airline}</p>
            <div className="w-full flex items-center gap-1 my-1">
              <div className="flex-1 h-px bg-blue-300" />
              <span className="text-blue-500 text-xs">✈</span>
              <div className="flex-1 h-px bg-blue-300" />
            </div>
            <p className="text-xs text-gray-400">{flight?.flightNumber}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{flight?.to?.airportCode}</p>
            <p className="text-xs text-gray-500">{flight?.to?.city}</p>
          </div>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="px-5 py-4">
        <button onClick={() => setShowBreakdown(!showBreakdown)}
          className="flex items-center justify-between w-full text-sm text-gray-600 mb-3">
          <span className="font-medium">Fare Breakdown</span>
          {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showBreakdown && (
          <div className="space-y-2 mb-3">
            {rows.map(r => (
              <div key={r.label} className="flex justify-between">
                <span className="text-xs text-gray-500">{r.label}</span>
                <span className={`text-xs font-medium ${r.color}`}>
                  {r.value < 0 ? `-₹${Math.abs(r.value).toLocaleString()}` : `₹${r.value.toLocaleString()}`}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <span className="font-bold text-gray-900">Total Amount</span>
          <span className="text-2xl font-bold text-blue-700">₹{total.toLocaleString()}</span>
        </div>
        {discount > 0 && (
          <div className="flex items-center gap-1.5 mt-2 bg-green-50 px-3 py-1.5 rounded-xl">
            <Tag className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs text-green-700 font-medium">You save ₹{discount.toLocaleString()}!</span>
          </div>
        )}
      </div>

      {/* Baggage info */}
      <div className="px-5 pb-3 flex gap-3">
        <div className="flex-1 bg-gray-50 rounded-xl p-2.5 text-center">
          <p className="text-xs text-gray-400">Cabin</p>
          <p className="text-xs font-semibold text-gray-700">{flight?.baggage?.cabin || '7 kg'}</p>
        </div>
        <div className="flex-1 bg-gray-50 rounded-xl p-2.5 text-center">
          <p className="text-xs text-gray-400">Check-in</p>
          <p className="text-xs font-semibold text-gray-700">{flight?.baggage?.checkin || '15 kg'}</p>
        </div>
        <div className="flex-1 bg-gray-50 rounded-xl p-2.5 text-center">
          <p className="text-xs text-gray-400">Refund</p>
          <p className={`text-xs font-semibold ${flight?.refundable ? 'text-green-600' : 'text-red-500'}`}>
            {flight?.refundable ? 'Yes' : 'No'}
          </p>
        </div>
      </div>

      {/* Proceed button */}
      {onProceed && (
        <div className="px-5 pb-5">
          <button onClick={onProceed} disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-60">
            {isLoading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
            ) : (
              <>Proceed to Payment →</>
            )}
          </button>
          <div className="flex items-center justify-center gap-1.5 mt-2.5">
            <Info className="w-3 h-3 text-gray-400" />
            <p className="text-xs text-gray-400">100% secure payment via Razorpay</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default PriceSummary
