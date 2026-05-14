// components/home/OffersSection.jsx
import { Tag, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

const offers = [
  { code:'FIRST200',  title:'New User Offer',      desc:'₹200 off on your first booking',     color:'from-blue-500 to-blue-700',      emoji:'🎁' },
  { code:'SUMMER20',  title:'Summer Sale',          desc:'Flat 20% off on all flights',         color:'from-orange-400 to-red-500',     emoji:'☀️' },
  { code:'INTL500',   title:'International Deal',   desc:'₹500 off on international flights',   color:'from-purple-500 to-violet-700',  emoji:'✈️' },
  { code:'WEEKEND10', title:'Weekend Special',      desc:'10% off every Saturday & Sunday',     color:'from-emerald-500 to-teal-600',   emoji:'🌴' },
]

const OffersSection = () => {
  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    toast.success(`Coupon code "${code}" copied!`)
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-5 h-5 text-orange-500" />
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-wider">Exclusive Deals</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Offers & Coupons</h2>
        <p className="text-gray-500 mb-8">Use these codes at checkout to save big on your next flight</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {offers.map(offer => (
            <div key={offer.code} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`bg-gradient-to-br ${offer.color} p-5 relative overflow-hidden`}>
                <div className="absolute top-[-20px] right-[-20px] text-white/10 text-7xl select-none">{offer.emoji}</div>
                <span className="text-3xl">{offer.emoji}</span>
                <h3 className="text-white font-bold mt-2">{offer.title}</h3>
                <p className="text-white/80 text-sm mt-1">{offer.desc}</p>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg px-3 py-1.5">
                  <span className="text-gray-800 font-bold text-sm tracking-widest">{offer.code}</span>
                </div>
                <button onClick={() => copyCode(offer.code)}
                  className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium">
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default OffersSection
