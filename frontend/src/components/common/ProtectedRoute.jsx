// components/common/ProtectedRoute.jsx — Route guard for authenticated & admin routes
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUser, selectIsAdmin } from '../../store/slices/authSlice'

/**
 * ProtectedRoute — requires a logged-in user
 * Redirects to /login with the original path saved in state
 */
export const ProtectedRoute = ({ children }) => {
  const user     = useSelector(selectUser)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

/**
 * AdminRoute — requires a logged-in admin user
 * Redirects non-admins to home, non-users to login
 */
export const AdminRoute = ({ children }) => {
  const user     = useSelector(selectUser)
  const isAdmin  = useSelector(selectIsAdmin)
  const location = useLocation()

  if (!user)    return <Navigate to="/login" state={{ from: location }} replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

/**
 * GuestRoute — only accessible when NOT logged in
 * e.g. Login, Register pages — redirects logged-in users to dashboard
 */
export const GuestRoute = ({ children }) => {
  const user = useSelector(selectUser)
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

// Default export is the basic ProtectedRoute
export default ProtectedRoute
