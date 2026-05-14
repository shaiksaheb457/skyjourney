// components/booking/CouponInput.jsx
import { useState } from 'react'
import { Tag, X, Check, Loader } from 'lucide-react'
import { applyCoupon } from '../../services/bookingService'
import toast from 'react-hot-toast'

const CouponInput = ({ totalAmount, onApply, onRemove, appliedCoupon }) => {
  const [code, setCode]         = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleApply = async () => {
    if (!code.trim()) return toast.error('Enter a coupon code')
    setIsLoading(true)
    try {
      const data = await applyCoupon(code.trim().toUpperCase(), totalAmount)
      onApply({ code: code.toUpperCase(), discount: data.data.discount, description: data.data.coupon.description })
      toast.success(`Coupon applied! You save ₹${data.data.discount}`)
      setCode('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon code')
    } finally { setIsLoading(false) }
  }

  if (appliedCoupon) return (
    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
          <Check className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-green-800">{appliedCoupon.code}</p>
          <p className="text-xs text-green-600">₹{appliedCoupon.discount.toLocaleString()} saved!</p>
        </div>
      </div>
      <button onClick={onRemove} className="p-1.5 hover:bg-green-100 rounded-lg transition-colors">
        <X className="w-4 h-4 text-green-600" />
      </button>
    </div>
  )

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleApply()}
            placeholder="Enter coupon code" maxLength={20}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono tracking-wider uppercase" />
        </div>
        <button onClick={handleApply} disabled={isLoading || !code.trim()}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap">
          {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Apply'}
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-1.5 ml-1">Try: FIRST200 · SUMMER20 · INTL500</p>
    </div>
  )
}

export default CouponInput
