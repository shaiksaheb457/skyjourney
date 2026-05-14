// services/adminService.js
import api from './api'

export const getRevenueDashboard = async (period = 30) => (await api.get(`/admin/revenue?period=${period}`)).data
export const getAllFlightsAdmin  = async (params)      => (await api.get('/admin/flights', { params })).data
export const createFlight        = async (data)        => (await api.post('/admin/flights', data)).data
export const updateFlight        = async (id, data)    => (await api.put(`/admin/flights/${id}`, data)).data
export const deleteFlight        = async (id)          => (await api.delete(`/admin/flights/${id}`)).data
export const getAllUsersAdmin     = async (params)      => (await api.get('/admin/users', { params })).data
export const getAllBookingsAdmin  = async (params)      => (await api.get('/admin/bookings', { params })).data
export const toggleUserStatus    = async (id)          => (await api.patch(`/admin/users/${id}/toggle-status`)).data
export const createCoupon        = async (data)        => (await api.post('/admin/coupons', data)).data
export const getAllCoupons        = async ()            => (await api.get('/admin/coupons')).data
