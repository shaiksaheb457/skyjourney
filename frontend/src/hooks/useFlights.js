// hooks/useFlights.js — Custom hook for flight search + state management
import { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  setFlights, setLoading, setError, setSearchParams,
  setSelectedFlight, setSortBy, setFilters, clearFlights,
} from '../store/slices/flightSlice'
import { searchFlights, getFlightById } from '../services/flightService'
import toast from 'react-hot-toast'

const useFlights = () => {
  const dispatch = useDispatch()
  const {
    flights, selectedFlight, searchParams,
    filters, sortBy, isLoading, error, totalResults,
  } = useSelector((state) => state.flights)

  const [isFetchingOne, setIsFetchingOne] = useState(false)

  /**
   * Search flights with given params (merges with existing searchParams)
   */
  const handleSearch = useCallback(async (params = {}) => {
    const merged = { ...searchParams, ...params }
    dispatch(setSearchParams(merged))
    dispatch(setLoading(true))
    dispatch(setError(null))
    try {
      const res = await searchFlights(merged)
      dispatch(setFlights({ flights: res.data?.flights || [], total: res.data?.total }))
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to search flights'
      dispatch(setError(msg))
      toast.error(msg)
    } finally {
      dispatch(setLoading(false))
    }
  }, [dispatch, searchParams])

  /**
   * Fetch a single flight by ID
   */
  const fetchFlightById = useCallback(async (id) => {
    setIsFetchingOne(true)
    try {
      const res = await getFlightById(id)
      dispatch(setSelectedFlight(res.data?.flight || res.data))
      return res.data?.flight || res.data
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load flight details'
      toast.error(msg)
      return null
    } finally {
      setIsFetchingOne(false)
    }
  }, [dispatch])

  /**
   * Update sort order and re-sort locally
   */
  const handleSortChange = useCallback((newSort) => {
    dispatch(setSortBy(newSort))
  }, [dispatch])

  /**
   * Update filter values
   */
  const handleFilterChange = useCallback((newFilters) => {
    dispatch(setFilters(newFilters))
  }, [dispatch])

  /**
   * Update search params without triggering a search
   */
  const updateSearchParams = useCallback((params) => {
    dispatch(setSearchParams(params))
  }, [dispatch])

  /**
   * Select a flight (e.g. for booking)
   */
  const selectFlight = useCallback((flight) => {
    dispatch(setSelectedFlight(flight))
  }, [dispatch])

  /**
   * Clear all flight results
   */
  const resetFlights = useCallback(() => {
    dispatch(clearFlights())
  }, [dispatch])

  /**
   * Compute sorted & filtered flights
   */
  const sortedFilteredFlights = (() => {
    let result = [...flights]

    // Apply filters
    if (filters.maxPrice) {
      result = result.filter(f => {
        const price = f.price?.[searchParams.cabinClass] || 0
        return price <= filters.maxPrice
      })
    }
    if (filters.airlines?.length) {
      result = result.filter(f => filters.airlines.includes(f.airline))
    }
    if (filters.stops?.length) {
      result = result.filter(f => filters.stops.includes(f.stops))
    }

    // Apply sorting
    switch (sortBy) {
      case 'cheapest':
        result.sort((a, b) =>
          (a.price?.[searchParams.cabinClass] || 0) - (b.price?.[searchParams.cabinClass] || 0))
        break
      case 'fastest':
        result.sort((a, b) => (a.duration || 0) - (b.duration || 0))
        break
      case 'earliest':
        result.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime))
        break
      case 'latest':
        result.sort((a, b) => new Date(b.departureTime) - new Date(a.departureTime))
        break
      default:
        break
    }

    return result
  })()

  return {
    flights: sortedFilteredFlights,
    rawFlights: flights,
    selectedFlight,
    searchParams,
    filters,
    sortBy,
    isLoading,
    isFetchingOne,
    error,
    totalResults,
    handleSearch,
    fetchFlightById,
    handleSortChange,
    handleFilterChange,
    updateSearchParams,
    selectFlight,
    resetFlights,
  }
}

export default useFlights
