import { createSlice } from '@reduxjs/toolkit'

const getUser = () => {
  try {
    const u = localStorage.getItem('skyjourney_user')
    return u ? JSON.parse(u) : null
  } catch { return null }
}

const initialState = {
  user:      getUser(),
  token:     localStorage.getItem('skyjourney_token') || null,
  isLoading: false,
  error:     null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload
      state.user  = user
      state.token = token
      localStorage.setItem('skyjourney_user',  JSON.stringify(user))
      localStorage.setItem('skyjourney_token', token)
    },
    logout: (state) => {
      state.user  = null
      state.token = null
      localStorage.removeItem('skyjourney_user')
      localStorage.removeItem('skyjourney_token')
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('skyjourney_user', JSON.stringify(state.user))
    },
  },
})

export const { setCredentials, logout, updateUser } = authSlice.actions
export default authSlice.reducer
export const selectUser      = (state) => state.auth.user
export const selectToken     = (state) => state.auth.token
export const selectIsLoggedIn= (state) => !!state.auth.user
export const selectIsAdmin   = (state) => state.auth.user?.role === 'admin'