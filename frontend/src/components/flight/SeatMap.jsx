// components/flight/SeatMap.jsx — Interactive aircraft seat selection map
import { useState } from 'react'

const ROWS_ECONOMY  = 28
const ROWS_BUSINESS = 6
const COLS_ECONOMY  = ['A', 'B', 'C', '', 'D', 'E', 'F']  // '' = aisle gap
const COLS_BUSINESS = ['A', 'B', '', 'C', 'D']

const TAKEN_MOCK = new Set([
  '1A','1B','2C','3D','4E','5F','7A','8B','9C','10D',
  '12A','12B','13C','14D','15E','16F','20A','21B','22C',
])

const getSeatStatus = (seatId, selectedSeats, takenSeats) => {
  if (selectedSeats.includes(seatId)) return 'selected'
  if (takenSeats.has(seatId))         return 'taken'
  return 'available'
}

const SeatButton = ({ seatId, status, onClick }) => {
  const base = 'w-8 h-7 rounded-md text-[10px] font-semibold transition-all border '
  const map  = {
    available: `${base} border-gray-200 bg-gray-50 text-gray-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 cursor-pointer`,
    selected:  `${base} border-blue-500 bg-blue-600 text-white cursor-pointer shadow-sm`,
    taken:     `${base} border-gray-200 bg-gray-200 text-gray-400 cursor-not-allowed opacity-60`,
  }

  return (
    <button
      className={map[status]}
      onClick={() => status !== 'taken' && onClick(seatId)}
      title={status === 'taken' ? 'Seat unavailable' : seatId}
      aria-label={`Seat ${seatId} — ${status}`}
    >
      {seatId.replace(/\d+/, '')}
    </button>
  )
}

const SeatMap = ({
  cabinClass   = 'economy',
  maxSelectable = 1,
  selectedSeats = [],
  onChange,
  takenSeats    = TAKEN_MOCK,
}) => {
  const [seats, setSeats] = useState(selectedSeats)

  const rows = cabinClass === 'economy' ? ROWS_ECONOMY  : ROWS_BUSINESS
  const cols = cabinClass === 'economy' ? COLS_ECONOMY  : COLS_BUSINESS

  const handleSeatClick = (seatId) => {
    let updated
    if (seats.includes(seatId)) {
      updated = seats.filter((s) => s !== seatId)
    } else if (seats.length < maxSelectable) {
      updated = [...seats, seatId]
    } else {
      // Replace oldest selection when at max
      updated = [...seats.slice(1), seatId]
    }
    setSeats(updated)
    onChange?.(updated)
  }

  return (
    <div className="select-none">
      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-gray-50 border border-gray-200 inline-block" /> Available</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-blue-600 border border-blue-500 inline-block" /> Selected</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-gray-200 border border-gray-200 inline-block opacity-60" /> Taken</span>
      </div>

      {/* Aircraft nose */}
      <div className="flex justify-center mb-3">
        <div className="flex flex-col items-center">
          <div className="w-12 h-6 bg-gray-100 rounded-t-full border border-gray-200 flex items-end justify-center pb-1">
            <span className="text-[9px] text-gray-400">✈</span>
          </div>
        </div>
      </div>

      {/* Cabin label */}
      {cabinClass !== 'economy' && (
        <div className="text-center mb-3">
          <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
            {cabinClass === 'business' ? 'Business Class' : 'First Class'}
          </span>
        </div>
      )}

      {/* Seat grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Column headers */}
          <div className="flex items-center gap-1 mb-1 ml-8">
            {cols.map((col, i) =>
              col ? (
                <div key={i} className="w-8 text-center text-[10px] font-bold text-gray-400">{col}</div>
              ) : (
                <div key={i} className="w-4" />
              )
            )}
          </div>

          {/* Rows */}
          <div className="space-y-1">
            {Array.from({ length: rows }, (_, rowIdx) => {
              const rowNum = rowIdx + 1
              return (
                <div key={rowNum} className="flex items-center gap-1">
                  {/* Row number */}
                  <div className="w-7 text-right text-[10px] text-gray-300 font-medium pr-1">{rowNum}</div>
                  {cols.map((col, i) =>
                    col ? (
                      <SeatButton
                        key={i}
                        seatId={`${rowNum}${col}`}
                        status={getSeatStatus(`${rowNum}${col}`, seats, takenSeats)}
                        onClick={handleSeatClick}
                      />
                    ) : (
                      <div key={i} className="w-4" />
                    )
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Selection summary */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {seats.length === 0
            ? 'No seat selected'
            : `Selected: ${seats.join(', ')}`}
        </p>
        {seats.length > 0 && (
          <button
            onClick={() => { setSeats([]); onChange?.([]) }}
            className="text-xs text-red-500 hover:text-red-600 font-medium"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}

export default SeatMap
