// pages/admin/AdminDashboard.jsx — Revenue charts + stats
import { useState, useEffect } from 'react'
import { Menu, Users, Plane, BookOpen, DollarSign, TrendingUp } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { getRevenueDashboard } from '../../services/adminService'
import toast from 'react-hot-toast'

const COLORS = ['#2563eb','#f59e0b','#10b981','#ef4444','#8b5cf6']

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}><Icon className="w-4 h-4" /></div>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
)

const AdminDashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [data, setData]             = useState(null)
  const [period, setPeriod]         = useState(30)
  const [isLoading, setIsLoading]   = useState(true)

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true)
      try {
        const res = await getRevenueDashboard(period)
        setData(res.data)
      } catch { toast.error('Failed to load dashboard') }
      finally { setIsLoading(false) }
    }
    fetch()
  }, [period])

  const overview = data?.overview || {}
  const charts   = data?.charts   || {}

  const revenueChart = (charts.dailyRevenue || []).map(d => ({
    date:     d._id?.slice(5), // MM-DD
    revenue:  d.revenue,
    bookings: d.bookings,
  }))

  const bookingsChart = (charts.dailyBookings || []).map(d => ({
    date:  d._id?.slice(5),
    count: d.count,
  }))

  const topAirlinesChart = (data?.topAirlines || []).map(a => ({
    name:     a._id,
    bookings: a.bookings,
  }))

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg"><Menu className="w-5 h-5 text-gray-600" /></button>
          <h1 className="text-lg font-bold text-gray-900 flex-1">Dashboard</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Period:</span>
            <select value={period} onChange={e => setPeriod(parseInt(e.target.value))}
              className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </header>

        <main className="flex-1 p-5 space-y-5">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Users"     value={isLoading ? '—' : overview.totalUsers}      icon={Users}     color="bg-blue-50 text-blue-600"   sub="Registered users" />
            <StatCard label="Total Flights"   value={isLoading ? '—' : overview.totalFlights}    icon={Plane}     color="bg-green-50 text-green-600"  sub="In database" />
            <StatCard label="Total Bookings"  value={isLoading ? '—' : overview.totalBookings}   icon={BookOpen}  color="bg-orange-50 text-orange-600" sub={`${overview.confirmedBookings || 0} confirmed`} />
            <StatCard label="Total Revenue"   value={isLoading ? '—' : `₹${(overview.totalRevenue||0).toLocaleString()}`} icon={DollarSign} color="bg-purple-50 text-purple-600" sub="All time" />
          </div>

          {/* Revenue line chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h2 className="font-bold text-gray-900">Revenue Over Time</h2>
            </div>
            {revenueChart.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No revenue data yet — make some bookings!</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={revenueChart} margin={{top:5,right:20,left:0,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{fontSize:11,fill:'#94a3b8'}} />
                  <YAxis tick={{fontSize:11,fill:'#94a3b8'}} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v,n) => n==='revenue' ? [`₹${v.toLocaleString()}`,`Revenue`] : [v,`Bookings`]} contentStyle={{borderRadius:'12px',border:'1px solid #e2e8f0',fontSize:'12px'}} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue"  stroke="#2563eb" strokeWidth={2.5} dot={false} name="Revenue (₹)" />
                  <Line type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={2} dot={false} name="Bookings" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Daily bookings bar chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-5">Bookings Per Day</h2>
              {bookingsChart.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={bookingsChart} margin={{top:5,right:10,left:0,bottom:5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{fontSize:10,fill:'#94a3b8'}} />
                    <YAxis tick={{fontSize:10,fill:'#94a3b8'}} allowDecimals={false} />
                    <Tooltip contentStyle={{borderRadius:'12px',border:'1px solid #e2e8f0',fontSize:'12px'}} />
                    <Bar dataKey="count" fill="#2563eb" radius={[4,4,0,0]} name="Bookings" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Top airlines pie chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-5">Top Airlines</h2>
              {topAirlinesChart.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No bookings data yet</div>
              ) : (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="55%" height={200}>
                    <PieChart>
                      <Pie data={topAirlinesChart} dataKey="bookings" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                        {topAirlinesChart.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius:'12px',border:'1px solid #e2e8f0',fontSize:'12px'}} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 flex-1">
                    {topAirlinesChart.map((a,i) => (
                      <div key={a.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{background:COLORS[i%COLORS.length]}} />
                        <span className="text-xs text-gray-600 flex-1 truncate">{a.name}</span>
                        <span className="text-xs font-semibold text-gray-800">{a.bookings}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Top routes table */}
          {(data?.topRoutes||[]).length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4">Top Routes</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Route</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">Bookings</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">Revenue</th>
                  </tr></thead>
                  <tbody>
                    {data.topRoutes.map((r,i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-3 font-medium text-gray-900">{r._id.from} → {r._id.to}</td>
                        <td className="py-3 px-3 text-right text-gray-600">{r.bookings}</td>
                        <td className="py-3 px-3 text-right font-semibold text-blue-700">₹{r.revenue?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
