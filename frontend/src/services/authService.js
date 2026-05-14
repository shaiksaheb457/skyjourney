import api from './api'

export const register = async (data) =>
  (await api.post('/auth/register', data)).data

export const login = async (data) =>
  (await api.post('/auth/login', data)).data

export const forgotPassword = async (email) =>
  (await api.post('/auth/forgot-password', { email })).data

export const verifyOTP = async (email, otp) =>
  (await api.post('/auth/verify-otp', { email, otp })).data

export const resetPassword = async (email, otp, newPassword) =>
  (await api.post('/auth/reset-password', { email, otp, newPassword })).data

export const getProfile = async () =>
  (await api.get('/users/')).data

export const updateProfile = async (data) =>
  (await api.put('/users/', data)).data