// components/admin/BookingsTable.jsx — Paginated bookings table for admin
import { useState } from 'react'
import { Eye, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { formatDate, formatCurrency, formatBookingStatus } from '../../utils/formatters'

const PAGE_SIZE = 10

const BookingsTable = ({
  bookings  = [],
  isLoading = false,
  onView,
  totalCount,
  currentPage = 1,
  onPageChange,
}) => {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? bookings.filter((b) =>
        b.bookingId?.toLowerCase().includes(search.toLowerCase()) ||
        b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.flight?.airline?.toLowerCase().includes(search.toLowerCase())
      )
    : bookings

  const totalPages = Math.ceil((totalCount ?? filtered.length) / PAGE_SIZE)

  const StatusBadge = ({ status }) => {
    const { label, color } = formatBookingStatus(status)
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
        {label}
      </span>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center gap-3">
        <h3 className="font-bold text-gray-900 flex-1">All Bookings</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ID, user, airline…"
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50">
              {['Booking ID', 'Passenger', 'Flight', 'Date', 'Amount', 'Status', ''].map((h) => (
                <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="py-3 px-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: j === 6 ? 32 : '80%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              : filtered.length === 0
              ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                      {search ? 'No bookings match your search' : 'No bookings yet'}
                    </td>
                  </tr>
                )
              : filtered.map((b) => (
                  <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-gray-600">
                      #{b.bookingId || b._id?.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900 truncate max-w-[140px]">
                        {b.user?.name || b.passengers?.[0]?.name || '—'}
                      </p>
                      <p className="text-xs text-gray-400">{b.user?.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-800">
                        {b.flight?.from?.airportCode} → {b.flight?.to?.airportCode}
                      </p>
                      <p className="text-xs text-gray-400">{b.flight?.airline}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      {formatDate(b.createdAt)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900 whitespace-nowrap">
                      {formatCurrency(b.totalAmount)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onView?.(b)}
                        className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
                        title="View booking"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingsTable
