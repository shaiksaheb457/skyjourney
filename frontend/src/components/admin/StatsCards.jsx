// components/admin/StatsCards.jsx — KPI stat cards for the admin dashboard
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * Single stat card
 * @param {string}    label       - Card title
 * @param {string}    value       - Main metric value
 * @param {ReactNode} icon        - Lucide icon component
 * @param {string}    color       - Tailwind bg+text classes for icon badge e.g. "bg-blue-50 text-blue-600"
 * @param {string}    [sub]       - Subtitle / supporting text
 * @param {number}    [trend]     - Percentage change (positive = up, negative = down)
 * @param {boolean}   [loading]   - Show skeleton shimmer
 */
export const StatCard = ({ label, value, icon: Icon, color, sub, trend, loading = false }) => {
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus
  const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-500' : 'text-gray-400'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500 font-medium">{label}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {loading ? (
        <>
          <div className="h-7 w-28 bg-gray-100 rounded-lg animate-pulse mb-2" />
          <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
        </>
      ) : (
        <>
          <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
          <div className="flex items-center gap-2 mt-1">
            {sub && <p className="text-xs text-gray-400">{sub}</p>}
            {trend !== undefined && trend !== null && (
              <span className={`flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
                <TrendIcon className="w-3 h-3" />
                {Math.abs(trend)}%
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}

/**
 * StatsCards — renders a responsive grid of StatCard components
 * @param {Array}   stats     - Array of stat objects: { label, value, icon, color, sub, trend }
 * @param {boolean} loading   - Pass true to show all cards in skeleton state
 * @param {number}  [cols=4]  - Number of columns on large screens (2, 3, or 4)
 */
const StatsCards = ({ stats = [], loading = false, cols = 4 }) => {
  const colMap = { 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' }

  return (
    <div className={`grid grid-cols-2 ${colMap[cols] || colMap[4]} gap-4`}>
      {stats.map((s, i) => (
        <StatCard key={i} {...s} loading={loading} />
      ))}
    </div>
  )
}

export default StatsCards
