// utils/formatters.js — Shared formatting helpers for SkyJourney

/**
 * Format a date string or Date object to "DD Mon YYYY"
 * e.g. "14 May 2026"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

/**
 * Format time to HH:MM (24-hour)
 */
export const formatTime = (dateStr) => {
  if (!dateStr) return '--:--'
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

/**
 * Format duration in minutes to "Xh Ym"
 */
export const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/**
 * Format a number as Indian Rupee currency
 * e.g. 12500 → "₹12,500"
 */
export const formatCurrency = (amount, showSymbol = true) => {
  if (amount == null) return '—'
  const formatted = Number(amount).toLocaleString('en-IN')
  return showSymbol ? `₹${formatted}` : formatted
}

/**
 * Format a date for <input type="date"> value (YYYY-MM-DD)
 */
export const formatDateInput = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toISOString().split('T')[0]
}

/**
 * Format date + time together
 * e.g. "14 May 2026, 06:30"
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—'
  return `${formatDate(dateStr)}, ${formatTime(dateStr)}`
}

/**
 * Get relative time label e.g. "2 hours ago", "just now"
 */
export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  if (mins < 1)   return 'Just now'
  if (mins < 60)  return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs} hr ago`
  const days = Math.floor(hrs / 24)
  if (days < 7)   return `${days} day${days > 1 ? 's' : ''} ago`
  return formatDate(dateStr)
}

/**
 * Capitalize first letter of each word
 */
export const titleCase = (str) => {
  if (!str) return ''
  return str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
}

/**
 * Truncate long strings with ellipsis
 */
export const truncate = (str, maxLen = 40) => {
  if (!str || str.length <= maxLen) return str
  return str.slice(0, maxLen - 1) + '…'
}

/**
 * Format booking status to a display-friendly label + color class
 */
export const formatBookingStatus = (status) => {
  const map = {
    pending:   { label: 'Pending',   color: 'text-yellow-600 bg-yellow-50' },
    confirmed: { label: 'Confirmed', color: 'text-green-600  bg-green-50'  },
    cancelled: { label: 'Cancelled', color: 'text-red-600    bg-red-50'    },
    completed: { label: 'Completed', color: 'text-blue-600   bg-blue-50'   },
    failed:    { label: 'Failed',    color: 'text-red-600    bg-red-50'    },
  }
  return map[status] || { label: titleCase(status || 'Unknown'), color: 'text-gray-600 bg-gray-50' }
}

/**
 * Format cabin class label
 */
export const formatCabinClass = (cls) => {
  const map = { economy: 'Economy', business: 'Business', firstClass: 'First Class' }
  return map[cls] || titleCase(cls || '')
}

/**
 * Parse and format a full name into initials (max 2 chars)
 */
export const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.trim().split(' ').filter(Boolean)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
