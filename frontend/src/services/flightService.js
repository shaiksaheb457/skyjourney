import api from './api'

export const searchFlights = async (params) =>
  (await api.get('/flights/search', { params })).data

export const getFlightById = async (id) =>
  (await api.get(`/flights/${id}`)).data

export const getAirlines = async () =>
  (await api.get('/flights/airlines')).data

export const getPopularRoutes = async () =>
  (await api.get('/flights/popular-routes')).data