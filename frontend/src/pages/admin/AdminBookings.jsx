// pages/admin/AdminBookings.jsx
import { useState, useEffect } from 'react'
import { Menu, Search, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { getAllBookingsAdmin } from '../../services/adminService'

const STATUS_COLORS = {
  confirmed:'bg-green-100 text-green-700', pending:'bg-yellow-100 text-yellow-700',
  cancelled:'bg-red-100 text-red-700',    completed:'bg-blue-100 text-blue-700',
}
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '--'

const AdminBookings = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [bookings, setBookings]     = useState([])
  const [isLoading, setIsLoading]   = useState(true)
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expanded, setExpanded]     = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllBookingsAdmin({ page:1, limit:50 })
        setBookings(data.data.bookings || [])
      } catch { toast.error('Failed to load bookings') }
      finally { setIsLoading(false) }
    }
    load()
  }, [])

  const filtered = bookings.filter(b => {
    const matchStatus = statusFilter === 'all' || b.status === statusFilter
    const matchSearch = !search || b.pnr?.includes(search.toUpperCase()) ||
      b.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.userId?.email?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg"><Menu className="w-5 h-5 text-gray-600" /></button>
          <h1 className="text-lg font-bold text-gray-900 flex-1">All Bookings</h1>
          <span className="text-sm text-gray-500">{filtered.length} bookings</span>
        </header>

        <main className="flex-1 p-5">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by PNR, name, email..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="all">All Status</option>
              {['confirmed','pending','cancelled','completed'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{['PNR','Passenger','Route','Date','Amount','Status','Details'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? Array.from({length:5}).map((_,i) => (
                    <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" /></td></tr>
                  )) : filtered.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No bookings found</td></tr>
                  ) : filtered.map(b => {
                    const flight = b.flightId || {}
                    return (
                      <>
                        <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">{b.pnr}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{b.userId?.name}</p>
                            <p className="text-xs text-gray-400">{b.userId?.email}</p>
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-800">{flight.from?.airportCode} → {flight.to?.airportCode}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{formatDate(flight.departureTime)}</td>
                          <td className="px-4 py-3 font-semibold text-gray-900">₹{(b.pricing?.totalAmount||0).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[b.status]||'bg-gray-100 text-gray-600'}`}>{b.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => setExpanded(expanded === b._id ? null : b._id)}
                              className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"><Eye className="w-3.5 h-3.5 text-blue-600" /></button>
                          </td>
                        </tr>
                        {expanded === b._id && (
                          <tr className="bg-blue-50/50">
                            <td colSpan={7} className="px-6 py-4">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                  {label:'Passengers',  value: b.passengers?.length},
                                  {label:'Cabin Class', value: b.cabinClass},
                                  {label:'Coupon',      value: b.couponCode || 'None'},
                                  {label:'Booked On',   value: formatDate(b.createdAt)},
                                ].map(d => (
                                  <div key={d.label} className="bg-white rounded-xl p-3">
                                    <p className="text-xs text-gray-400">{d.label}</p>
                                    <p className="text-sm font-semibold text-gray-800 capitalize">{d.value}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-3">
                                <p className="text-xs font-semibold text-gray-600 mb-2">Passengers</p>
                                <div className="flex flex-wrap gap-2">
                                  {b.passengers?.map((p,i) => (
                                    <div key={i} className="bg-white rounded-xl px-3 py-2 text-xs">
                                      <span className="font-semibold text-gray-800">{p.name}</span>
                                      <span className="text-gray-400 ml-1 capitalize">· {p.gender} · {p.age}y</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminBookings
