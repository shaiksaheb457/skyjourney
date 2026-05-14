// pages/admin/AdminFlights.jsx — Full flight CRUD
import { useState, useEffect } from 'react'
import { Menu, Plus, Edit2, Trash2, Search, X, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { getAllFlightsAdmin, createFlight, updateFlight, deleteFlight } from '../../services/adminService'

const INITIAL = {
  airline:'', airlineCode:'', flightNumber:'',
  from:{ city:'', airport:'', airportCode:'' },
  to:  { city:'', airport:'', airportCode:'' },
  departureTime:'', arrivalTime:'', stops:0,
  price:{ economy:0, business:0, firstClass:0 },
  seats:{ economy:{total:150,available:150}, business:{total:20,available:20} },
  baggage:{ cabin:'7 kg', checkin:'15 kg' },
  refundable:true, cancellationCharge:500, status:'scheduled',
  amenities:{ meals:false, wifi:false, usb:true },
}

const FlightModal = ({ flight, onClose, onSave }) => {
  const [form, setForm]       = useState(flight || INITIAL)
  const [isLoading, setIsLoading] = useState(false)
  const isEdit = !!flight?._id

  const set = (path, value) => {
    setForm(prev => {
      const updated = { ...prev }
      const keys    = path.split('.')
      let   obj     = updated
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] }
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.airline || !form.flightNumber || !form.departureTime) return toast.error('Fill all required fields')
    setIsLoading(true)
    try {
      if (isEdit) {
        const data = await updateFlight(flight._id, form)
        onSave(data.data.flight, 'update')
        toast.success('Flight updated!')
      } else {
        const data = await createFlight(form)
        onSave(data.data.flight, 'create')
        toast.success('Flight created!')
      }
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save flight')
    } finally { setIsLoading(false) }
  }

  const Field = ({ label, value, onChange, type='text', required=false, className='' }) => (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}{required && ' *'}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">{isEdit ? 'Edit Flight' : 'Add New Flight'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Airline info */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Airline Information</p>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Airline Name" value={form.airline} onChange={v=>set('airline',v)} required className="col-span-1" />
              <Field label="Airline Code" value={form.airlineCode} onChange={v=>set('airlineCode',v.toUpperCase())} required />
              <Field label="Flight Number" value={form.flightNumber} onChange={v=>set('flightNumber',v.toUpperCase())} required />
            </div>
          </div>

          {/* Route */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Route</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs text-blue-600 font-semibold">FROM</p>
                <Field label="City" value={form.from.city} onChange={v=>set('from.city',v)} required />
                <Field label="Airport Code" value={form.from.airportCode} onChange={v=>set('from.airportCode',v.toUpperCase())} required />
                <Field label="Airport Name" value={form.from.airport} onChange={v=>set('from.airport',v)} />
              </div>
              <div className="space-y-2">
                <p className="text-xs text-green-600 font-semibold">TO</p>
                <Field label="City" value={form.to.city} onChange={v=>set('to.city',v)} required />
                <Field label="Airport Code" value={form.to.airportCode} onChange={v=>set('to.airportCode',v.toUpperCase())} required />
                <Field label="Airport Name" value={form.to.airport} onChange={v=>set('to.airport',v)} />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Schedule</p>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Departure Time" type="datetime-local" value={form.departureTime?.slice(0,16)} onChange={v=>set('departureTime',new Date(v).toISOString())} required />
              <Field label="Arrival Time"   type="datetime-local" value={form.arrivalTime?.slice(0,16)}   onChange={v=>set('arrivalTime',new Date(v).toISOString())}   required />
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Stops</label>
                <select value={form.stops} onChange={e=>set('stops',parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value={0}>Non-stop</option><option value={1}>1 Stop</option><option value={2}>2 Stops</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Pricing (₹)</p>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Economy"    type="number" value={form.price.economy}    onChange={v=>set('price.economy',parseInt(v))}    required />
              <Field label="Business"   type="number" value={form.price.business}   onChange={v=>set('price.business',parseInt(v))}   />
              <Field label="First Class" type="number" value={form.price.firstClass} onChange={v=>set('price.firstClass',parseInt(v))} />
            </div>
          </div>

          {/* Status + refundable */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select value={form.status} onChange={e=>set('status',e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {['scheduled','delayed','cancelled','completed'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.refundable} onChange={e=>set('refundable',e.target.checked)} className="w-4 h-4 rounded accent-blue-600" />
                <span className="text-sm text-gray-700">Refundable</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-all text-sm">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all text-sm disabled:opacity-60">
              {isLoading ? 'Saving...' : (isEdit ? 'Update Flight' : 'Create Flight')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const AdminFlights = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [flights, setFlights]       = useState([])
  const [isLoading, setIsLoading]   = useState(true)
  const [search, setSearch]         = useState('')
  const [showModal, setShowModal]   = useState(false)
  const [editFlight, setEditFlight] = useState(null)
  const [sortField, setSortField]   = useState('departureTime')
  const [sortDir, setSortDir]       = useState('asc')

  const load = async () => {
    setIsLoading(true)
    try {
      const data = await getAllFlightsAdmin({ page:1, limit:50 })
      setFlights(data.data.flights || [])
    } catch { toast.error('Failed to load flights') }
    finally { setIsLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSave = (flight, type) => {
    if (type === 'create') setFlights(prev => [flight, ...prev])
    else setFlights(prev => prev.map(f => f._id === flight._id ? flight : f))
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this flight? This cannot be undone.')) return
    try {
      await deleteFlight(id)
      setFlights(prev => prev.filter(f => f._id !== id))
      toast.success('Flight deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete flight')
    }
  }

  const filtered = flights.filter(f =>
    f.flightNumber?.toLowerCase().includes(search.toLowerCase()) ||
    f.airline?.toLowerCase().includes(search.toLowerCase()) ||
    f.from?.city?.toLowerCase().includes(search.toLowerCase()) ||
    f.to?.city?.toLowerCase().includes(search.toLowerCase())
  )

  const formatDT = (d) => d ? new Date(d).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',hour12:false}) : '--'

  const STATUS_COLORS = { scheduled:'bg-green-100 text-green-700', delayed:'bg-yellow-100 text-yellow-700', cancelled:'bg-red-100 text-red-700', completed:'bg-blue-100 text-blue-700' }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg"><Menu className="w-5 h-5 text-gray-600" /></button>
          <h1 className="text-lg font-bold text-gray-900 flex-1">Manage Flights</h1>
          <button onClick={() => { setEditFlight(null); setShowModal(true) }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all">
            <Plus className="w-4 h-4" /> Add Flight
          </button>
        </header>

        <main className="flex-1 p-5">
          {/* Search */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by flight, airline, city..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Flight','Route','Departure','Stops','Economy Price','Status','Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    Array.from({length:5}).map((_,i) => (
                      <tr key={i}><td colSpan={7} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                      </td></tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                      {search ? 'No flights match your search' : 'No flights yet. Click "Add Flight" to create one.'}
                    </td></tr>
                  ) : filtered.map(f => (
                    <tr key={f._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{f.flightNumber}</p>
                        <p className="text-xs text-gray-400">{f.airline}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{f.from?.airportCode} → {f.to?.airportCode}</p>
                        <p className="text-xs text-gray-400">{f.from?.city} → {f.to?.city}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{formatDT(f.departureTime)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${f.stops === 0 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {f.stops === 0 ? 'Non-stop' : `${f.stops} stop`}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-blue-700">₹{(f.price?.economy||0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[f.status]||'bg-gray-100 text-gray-600'}`}>{f.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setEditFlight(f); setShowModal(true) }}
                            className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5 text-blue-600" /></button>
                          <button onClick={() => handleDelete(f._id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">{filtered.length} flight{filtered.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </main>
      </div>
      {showModal && <FlightModal flight={editFlight} onClose={() => setShowModal(false)} onSave={handleSave} />}
    </div>
  )
}

export default AdminFlights
