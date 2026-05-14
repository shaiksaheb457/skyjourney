// App.jsx — All Routes (Final)
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUser, selectIsAdmin } from './store/slices/authSlice'

import HomePage            from './pages/HomePage'
import SearchResultsPage   from './pages/SearchResultsPage'
import BookingPage         from './pages/BookingPage'
import FlightDetailsPage   from './pages/FlightDetailsPage'
import LoginPage           from './pages/auth/LoginPage'
import RegisterPage        from './pages/auth/RegisterPage'
import ForgotPasswordPage  from './pages/auth/ForgotPasswordPage'
import PaymentPage         from './pages/payment/PaymentPage'
import PaymentSuccessPage  from './pages/payment/PaymentSuccessPage'
import PaymentFailedPage   from './pages/payment/PaymentFailedPage'
import DashboardPage       from './pages/user/DashboardPage'
import MyBookingsPage      from './pages/user/MyBookingsPage'
import ProfilePage         from './pages/user/ProfilePage'
import AdminDashboard      from './pages/admin/AdminDashboard'
import AdminFlights        from './pages/admin/AdminFlights'
import AdminBookings       from './pages/admin/AdminBookings'
import AdminUsers          from './pages/admin/AdminUsers'
import AdminRevenue        from './pages/admin/AdminRevenue'

const ProtectedRoute = ({ children }) => {
  const user = useSelector(selectUser)
  return user ? children : <Navigate to="/login" replace />
}

const AdminRoute = ({ children }) => {
  const user    = useSelector(selectUser)
  const isAdmin = useSelector(selectIsAdmin)
  if (!user)    return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"                 element={<HomePage />} />
      <Route path="/login"            element={<LoginPage />} />
      <Route path="/register"         element={<RegisterPage />} />
      <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
      <Route path="/search"           element={<SearchResultsPage />} />
      <Route path="/flights/:id"      element={<FlightDetailsPage />} />

      {/* User protected */}
      <Route path="/booking/:flightId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
      <Route path="/payment"           element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
      <Route path="/payment/success"   element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
      <Route path="/payment/failed"    element={<ProtectedRoute><PaymentFailedPage /></ProtectedRoute>} />
      <Route path="/dashboard"         element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/my-bookings"       element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
      <Route path="/profile"           element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin"             element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/flights"     element={<AdminRoute><AdminFlights /></AdminRoute>} />
      <Route path="/admin/bookings"    element={<AdminRoute><AdminBookings /></AdminRoute>} />
      <Route path="/admin/users"       element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/revenue"     element={<AdminRoute><AdminRevenue /></AdminRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
