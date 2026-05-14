// hooks/useAuth.js — Custom hook for auth state
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout, selectUser, selectToken, selectIsLoggedIn, selectIsAdmin } from '../store/slices/authSlice'
import toast from 'react-hot-toast'

const useAuth = () => {
  const dispatch    = useDispatch()
  const navigate    = useNavigate()
  const user        = useSelector(selectUser)
  const token       = useSelector(selectToken)
  const isLoggedIn  = useSelector(selectIsLoggedIn)
  const isAdmin     = useSelector(selectIsAdmin)

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Logged out successfully')
    navigate('/')
  }

  const requireAuth = (redirectTo = '/login') => {
    if (!isLoggedIn) {
      navigate(redirectTo)
      return false
    }
    return true
  }

  return { user, token, isLoggedIn, isAdmin, handleLogout, requireAuth }
}

export default useAuth
