// pages/admin/AdminRevenue.jsx — Revenue analytics
import { useState, useEffect } from 'react'
import { Menu, TrendingUp, DollarSign, BookOpen, Plane } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import AdminSidebar        from '../../components/admin/AdminSidebar'
import { RevenueLineChart, BookingsBarChart } from '../../components/admin/RevenueChart'
import { getRevenueDashboard } from '../../services/adminService'
import toast from 'react-hot-toast'

const COLORS = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
)

const AdminRevenue = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [data, setData]             = useState(null)
  const [period, setPeriod]         = useState(30)
  const [isLoading, setIsLoading]   = useState(true)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const res = await getRevenueDashboard(period)
        setData(res.data)
      } catch {
        toast.error('Failed to load revenue data')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [period])

  const overview = data?.overview || {}
  const charts   = data?.charts   || {}

  // Shape data to match what RevenueChart components expect
  const revenueChartData = (charts.dailyRevenue || []).map(d => ({
    date:     d._id?.slice(5),
    revenue:  d.revenue,
    bookings: d.bookings,
  }))

  const bookingsChartData = (charts.dailyBookings || []).map(d => ({
    date:  d._id?.slice(5),
    count: d.count,
  }))

  const topAirlinesData = (data?.topAirlines || []).map(a => ({
    name:     a._id,
    bookings: a.bookings,
  }))

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h1 className="text-lg font-bold text-gray-900 flex-1">Revenue</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Period:</span>
            <select
              value={period}
              onChange={e => setPeriod(parseInt(e.target.value))}
              className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </header>

        <main className="flex-1 p-5 space-y-5">

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Revenue"
              value={isLoading ? '—' : `₹${(overview.totalRevenue || 0).toLocaleString('en-IN')}`}
              icon={DollarSign}
              color="bg-blue-50 text-blue-600"
              sub="All confirmed payments"
            />
            <StatCard
              label="Total Bookings"
              value={isLoading ? '—' : overview.totalBookings ?? '—'}
              icon={BookOpen}
              color="bg-orange-50 text-orange-600"
              sub={`${overview.confirmedBookings || 0} confirmed`}
            />
            <StatCard
              label="Cancelled"
              value={isLoading ? '—' : overview.cancelledBookings ?? '—'}
              icon={Plane}
              color="bg-red-50 text-red-500"
              sub="Cancelled bookings"
            />
            <StatCard
              label="Avg. per Booking"
              value={
                isLoading ? '—'
                : overview.confirmedBookings
                  ? `₹${Math.round((overview.totalRevenue || 0) / overview.confirmedBookings).toLocaleString('en-IN')}`
                  : '₹0'
              }
              icon={TrendingUp}
              color="bg-green-50 text-green-600"
              sub="Revenue / confirmed booking"
            />
          </div>

          {/* Revenue line chart — from RevenueChart.jsx */}
          <RevenueLineChart data={revenueChartData} isLoading={isLoading} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Bookings bar chart — from RevenueChart.jsx */}
            <BookingsBarChart data={bookingsChartData} isLoading={isLoading} />

            {/* Top airlines pie chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-5">Top Airlines</h2>
              {isLoading ? (
                <div className="h-[220px] flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-gray-100 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : topAirlinesData.length === 0 ? (
                <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
                  No bookings data yet
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="55%" height={200}>
                    <PieChart>
                      <Pie
                        data={topAirlinesData} dataKey="bookings" nameKey="name"
                        cx="50%" cy="50%" outerRadius={80} innerRadius={40}
                      >
                        {topAirlinesData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 flex-1">
                    {topAirlinesData.map((a, i) => (
                      <div key={a.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
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
          {(data?.topRoutes || []).length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4">Top Routes</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Route</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">Bookings</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topRoutes.map((r, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3 font-medium text-gray-900">{r._id.from} → {r._id.to}</td>
                        <td className="py-3 px-3 text-right text-gray-600">{r.bookings}</td>
                        <td className="py-3 px-3 text-right font-semibold text-blue-700">
                          ₹{r.revenue?.toLocaleString('en-IN')}
                        </td>
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

export default AdminRevenue
