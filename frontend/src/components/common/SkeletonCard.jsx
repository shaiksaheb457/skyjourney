// components/common/SkeletonCard.jsx — Skeleton placeholders for loading states

const Shimmer = ({ className = '' }) => (
  <div className={`bg-gray-100 rounded-lg animate-pulse ${className}`} />
)

/**
 * FlightCardSkeleton — mimics the shape of FlightCard
 */
export const FlightCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      {/* Airline badge */}
      <div className="flex-shrink-0 flex flex-col items-center gap-1">
        <Shimmer className="w-12 h-12 rounded-xl" />
        <Shimmer className="w-10 h-3" />
      </div>

      {/* Route */}
      <div className="flex-1 flex items-center gap-3">
        <div className="text-center space-y-1">
          <Shimmer className="w-16 h-7" />
          <Shimmer className="w-10 h-4" />
          <Shimmer className="w-14 h-3" />
        </div>

        <div className="flex-1 flex flex-col items-center gap-2 px-2">
          <Shimmer className="w-14 h-3" />
          <Shimmer className="w-full h-px" />
          <Shimmer className="w-16 h-3" />
        </div>

        <div className="text-center space-y-1">
          <Shimmer className="w-16 h-7" />
          <Shimmer className="w-10 h-4" />
          <Shimmer className="w-14 h-3" />
        </div>
      </div>

      {/* Price & button */}
      <div className="flex-shrink-0 flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 w-full sm:w-auto">
        <Shimmer className="w-24 h-8" />
        <Shimmer className="w-28 h-10 rounded-xl" />
      </div>
    </div>

    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
      <Shimmer className="w-20 h-3" />
      <Shimmer className="w-24 h-3" />
      <Shimmer className="w-16 h-3" />
    </div>
  </div>
)

/**
 * BookingCardSkeleton — mimics a booking history card
 */
export const BookingCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
    <div className="flex items-center justify-between">
      <Shimmer className="w-32 h-5" />
      <Shimmer className="w-20 h-6 rounded-full" />
    </div>
    <div className="flex items-center gap-4">
      <div className="space-y-1">
        <Shimmer className="w-16 h-7" />
        <Shimmer className="w-20 h-3" />
      </div>
      <div className="flex-1 flex flex-col items-center gap-1">
        <Shimmer className="w-full h-px" />
        <Shimmer className="w-12 h-3" />
      </div>
      <div className="space-y-1 text-right">
        <Shimmer className="w-16 h-7" />
        <Shimmer className="w-20 h-3" />
      </div>
    </div>
    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
      <Shimmer className="w-24 h-4" />
      <Shimmer className="w-20 h-4" />
    </div>
  </div>
)

/**
 * ProfileSkeleton
 */
export const ProfileSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
    <div className="flex items-center gap-4">
      <Shimmer className="w-16 h-16 rounded-full" />
      <div className="space-y-2">
        <Shimmer className="w-36 h-5" />
        <Shimmer className="w-48 h-4" />
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Shimmer className="w-20 h-3" />
          <Shimmer className="w-full h-10 rounded-xl" />
        </div>
      ))}
    </div>
  </div>
)

/**
 * TableRowSkeleton — for admin tables
 */
export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Shimmer className="h-4 w-full" />
      </td>
    ))}
  </tr>
)

/**
 * Default export: generic card skeleton
 */
const SkeletonCard = ({ lines = 3 }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
    <Shimmer className="w-3/4 h-5" />
    {Array.from({ length: lines }).map((_, i) => (
      <Shimmer key={i} className={`h-4 ${i % 2 === 0 ? 'w-full' : 'w-5/6'}`} />
    ))}
  </div>
)

export default SkeletonCard
