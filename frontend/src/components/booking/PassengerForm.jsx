// components/booking/PassengerForm.jsx
import { User, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

const GENDERS  = ['male','female','other']
const MEALS    = ['none','veg','non-veg','vegan','jain']
const TYPES    = ['adult','child','infant']

const PassengerForm = ({ index, passenger, onChange, savedTravelers = [] }) => {
  const [expanded, setExpanded]     = useState(index === 0)
  const [showSaved, setShowSaved]   = useState(false)

  const set = (field, value) => onChange(index, { ...passenger, [field]: value })

  const loadSaved = (t) => {
    onChange(index, { ...passenger, name: t.name, age: t.age, gender: t.gender, passportNumber: t.passportNumber || '' })
    setShowSaved(false)
  }

  const isComplete = passenger.name && passenger.age && passenger.gender

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isComplete ? 'bg-green-100' : 'bg-blue-100'}`}>
            <User className={`w-4 h-4 ${isComplete ? 'text-green-600' : 'text-blue-600'}`} />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">
              Passenger {index + 1} {passenger.name && `— ${passenger.name}`}
            </p>
            <p className="text-xs text-gray-400 capitalize">{passenger.type || 'adult'} · {isComplete ? '✓ Details filled' : 'Fill details'}</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100">
          {/* Saved travelers */}
          {savedTravelers.length > 0 && (
            <div className="pt-3">
              <button onClick={() => setShowSaved(!showSaved)}
                className="text-xs text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
                📋 Fill from saved travelers
              </button>
              {showSaved && (
                <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden">
                  {savedTravelers.map((t,i) => (
                    <button key={i} onClick={() => loadSaved(t)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 text-left border-b border-gray-100 last:border-0">
                      <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold">{t.name?.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{t.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{t.gender} · {t.age} yrs</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Passenger type */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Passenger Type</label>
              <div className="flex gap-2">
                {TYPES.map(t => (
                  <button key={t} onClick={() => set('type', t)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all capitalize ${passenger.type===t ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Gender *</label>
              <div className="flex gap-2">
                {GENDERS.map(g => (
                  <button key={g} onClick={() => set('gender', g)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all capitalize ${passenger.gender===g ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Full name */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name * <span className="text-gray-400">(as on ID)</span></label>
              <input value={passenger.name || ''} onChange={e => set('name', e.target.value)}
                placeholder="Enter full name" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Age *</label>
              <input type="number" value={passenger.age || ''} onChange={e => set('age', parseInt(e.target.value))}
                placeholder="Age" min={0} max={120}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>

            {/* Passport */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Passport / ID Number <span className="text-gray-400">(optional)</span></label>
              <input value={passenger.passportNumber || ''} onChange={e => set('passportNumber', e.target.value)}
                placeholder="Passport or Aadhaar number"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>

            {/* Meal */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Meal Preference</label>
              <select value={passenger.meal || 'none'} onChange={e => set('meal', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white capitalize">
                {MEALS.map(m => <option key={m} value={m} className="capitalize">{m === 'none' ? 'No preference' : m}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PassengerForm
