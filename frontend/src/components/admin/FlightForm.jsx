// components/admin/FlightForm.jsx — Create / edit flight form (modal)
import { useState } from 'react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import { createFlight, updateFlight } from '../../services/adminService'

const INITIAL_FORM = {
  airline: '', airlineCode: '', flightNumber: '',
  from: { city: '', airport: '', airportCode: '' },
  to:   { city: '', airport: '', airportCode: '' },
  departureTime: '', arrivalTime: '',
  stops: 0,
  price: { economy: 0, business: 0, firstClass: 0 },
  seats: {
    economy:  { total: 150, available: 150 },
    business: { total: 20,  available: 20  },
  },
  baggage: { cabin: '7 kg', checkin: '15 kg' },
  refundable: true,
  cancellationCharge: 500,
  status: 'scheduled',
  amenities: { meals: false, wifi: false, usb: true },
}

const Field = ({ label, value, onChange, type = 'text', required = false, className = '', options }) => (
  <div className={className}>
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {options ? (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      />
    )}
  </div>
)

const SectionLabel = ({ children }) => (
  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{children}</p>
)

const Checkbox = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
    />
    <span className="text-sm text-gray-700">{label}</span>
  </label>
)

const FlightForm = ({ flight, onClose, onSave }) => {
  const [form, setForm]       = useState(flight ? { ...INITIAL_FORM, ...flight } : INITIAL_FORM)
  const [isLoading, setLoading] = useState(false)
  const isEdit = !!flight?._id

  // Deep set helper for nested fields like "from.city"
  const set = (path, value) => {
    setForm((prev) => {
      const updated = structuredClone(prev)
      const keys    = path.split('.')
      let obj = updated
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.airline || !form.flightNumber || !form.departureTime || !form.arrivalTime) {
      return toast.error('Fill all required fields')
    }
    setLoading(true)
    try {
      if (isEdit) {
        const res = await updateFlight(flight._id, form)
        onSave?.(res.data?.flight || res.data, 'update')
        toast.success('Flight updated!')
      } else {
        const res = await createFlight(form)
        onSave?.(res.data?.flight || res.data, 'create')
        toast.success('Flight created!')
      }
      onClose?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save flight')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">
            {isEdit ? 'Edit Flight' : 'Add New Flight'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Airline */}
          <div>
            <SectionLabel>Airline Information</SectionLabel>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Airline Name" value={form.airline}     onChange={(v) => set('airline', v)}     required className="col-span-2" />
              <Field label="IATA Code"    value={form.airlineCode} onChange={(v) => set('airlineCode', v)} required />
            </div>
            <div className="mt-3">
              <Field label="Flight Number" value={form.flightNumber} onChange={(v) => set('flightNumber', v)} required />
            </div>
          </div>

          {/* Route */}
          <div>
            <SectionLabel>Route</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-blue-600">Departure</p>
                <Field label="City"         value={form.from.city}        onChange={(v) => set('from.city', v)}        required />
                <Field label="Airport Name" value={form.from.airport}     onChange={(v) => set('from.airport', v)}     required />
                <Field label="IATA Code"    value={form.from.airportCode} onChange={(v) => set('from.airportCode', v)} required />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-green-600">Arrival</p>
                <Field label="City"         value={form.to.city}        onChange={(v) => set('to.city', v)}        required />
                <Field label="Airport Name" value={form.to.airport}     onChange={(v) => set('to.airport', v)}     required />
                <Field label="IATA Code"    value={form.to.airportCode} onChange={(v) => set('to.airportCode', v)} required />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <SectionLabel>Schedule</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Departure Time" type="datetime-local" value={form.departureTime} onChange={(v) => set('departureTime', v)} required />
              <Field label="Arrival Time"   type="datetime-local" value={form.arrivalTime}   onChange={(v) => set('arrivalTime', v)}   required />
            </div>
            <div className="mt-3">
              <Field label="Stops" value={form.stops} type="number" onChange={(v) => set('stops', parseInt(v) || 0)}
                options={[{value:0,label:'Non-stop'},{value:1,label:'1 Stop'},{value:2,label:'2 Stops'}]} />
            </div>
          </div>

          {/* Pricing */}
          <div>
            <SectionLabel>Pricing (₹ per seat)</SectionLabel>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Economy"    type="number" value={form.price.economy}    onChange={(v) => set('price.economy', parseFloat(v) || 0)} required />
              <Field label="Business"   type="number" value={form.price.business}   onChange={(v) => set('price.business', parseFloat(v) || 0)} />
              <Field label="First Class" type="number" value={form.price.firstClass} onChange={(v) => set('price.firstClass', parseFloat(v) || 0)} />
            </div>
          </div>

          {/* Options */}
          <div>
            <SectionLabel>Options</SectionLabel>
            <div className="flex flex-wrap gap-4">
              <Checkbox label="Refundable"     checked={form.refundable}          onChange={(v) => set('refundable', v)} />
              <Checkbox label="Meals Included" checked={form.amenities.meals}     onChange={(v) => set('amenities.meals', v)} />
              <Checkbox label="WiFi"           checked={form.amenities.wifi}      onChange={(v) => set('amenities.wifi', v)} />
            </div>
            <div className="mt-3">
              <Field label="Status" value={form.status} onChange={(v) => set('status', v)}
                options={[
                  { value: 'scheduled',  label: 'Scheduled'  },
                  { value: 'delayed',    label: 'Delayed'    },
                  { value: 'cancelled',  label: 'Cancelled'  },
                  { value: 'completed',  label: 'Completed'  },
                ]}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-w-[100px]">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </span>
              ) : isEdit ? 'Save Changes' : 'Create Flight'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FlightForm
