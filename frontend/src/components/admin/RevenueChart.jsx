// components/admin/RevenueChart.jsx — Revenue line + bookings bar chart panel
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'
import { TrendingUp } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="font-medium">
          {entry.name}: {entry.name.includes('₹') || entry.name === 'Revenue'
            ? `₹${Number(entry.value).toLocaleString('en-IN')}`
            : entry.value}
        </p>
      ))}
    </div>
  )
}

/**
 * RevenueLineChart — daily revenue over time
 */
export const RevenueLineChart = ({ data = [], isLoading = false }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <div className="flex items-center gap-2 mb-5">
      <TrendingUp className="w-4 h-4 text-blue-600" />
      <h2 className="font-bold text-gray-900">Revenue Over Time</h2>
    </div>

    {isLoading ? (
      <div className="h-[260px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-100 border-t-blue-600 rounded-full animate-spin" />
      </div>
    ) : data.length === 0 ? (
      <div className="h-[260px] flex items-center justify-center text-gray-400 text-sm">
        No revenue data yet
      </div>
    ) : (
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone" dataKey="revenue"
            stroke="#2563eb" strokeWidth={2.5} dot={false} name="Revenue"
          />
          <Line
            type="monotone" dataKey="bookings"
            stroke="#10b981" strokeWidth={2} dot={false} name="Bookings"
          />
        </LineChart>
      </ResponsiveContainer>
    )}
  </div>
)

/**
 * BookingsBarChart — daily bookings count
 */
export const BookingsBarChart = ({ data = [], isLoading = false }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <h2 className="font-bold text-gray-900 mb-5">Bookings Per Day</h2>

    {isLoading ? (
      <div className="h-[220px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-100 border-t-blue-600 rounded-full animate-spin" />
      </div>
    ) : data.length === 0 ? (
      <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
        No bookings data yet
      </div>
    ) : (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Bookings" />
        </BarChart>
      </ResponsiveContainer>
    )}
  </div>
)

/**
 * RevenueChart — default export: combined revenue + bookings
 */
const RevenueChart = ({ revenueData = [], bookingsData = [], isLoading = false }) => (
  <div className="space-y-5">
    <RevenueLineChart data={revenueData} isLoading={isLoading} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <BookingsBarChart data={bookingsData} isLoading={isLoading} />
    </div>
  </div>
)

export default RevenueChart
