// utils/validators.js — Form and data validation helpers for SkyJourney

/**
 * Validate email address format
 */
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())
}

/**
 * Validate Indian mobile number (10 digits, starts with 6-9)
 */
export const isValidPhone = (phone) => {
  return /^[6-9]\d{9}$/.test(String(phone).replace(/\s+/g, ''))
}

/**
 * Validate password strength:
 * - Min 8 chars
 * - At least one uppercase, one lowercase, one digit
 */
export const validatePassword = (password) => {
  const errors = []
  if (!password || password.length < 8)      errors.push('At least 8 characters')
  if (!/[A-Z]/.test(password))               errors.push('One uppercase letter')
  if (!/[a-z]/.test(password))               errors.push('One lowercase letter')
  if (!/\d/.test(password))                  errors.push('One number')
  return { valid: errors.length === 0, errors }
}

/**
 * Validate a passenger object:
 * { name, age, gender, passportNumber (optional) }
 */
export const validatePassenger = (passenger, index) => {
  const errors = {}
  const label  = `Passenger ${index + 1}`

  if (!passenger.name?.trim())
    errors.name = `${label}: Name is required`

  if (!passenger.age || isNaN(passenger.age) || passenger.age < 1 || passenger.age > 120)
    errors.age = `${label}: Enter a valid age (1–120)`

  if (!passenger.gender)
    errors.gender = `${label}: Gender is required`

  if (passenger.needsPassport && !passenger.passportNumber?.trim())
    errors.passportNumber = `${label}: Passport number is required for international flights`

  return { valid: Object.keys(errors).length === 0, errors }
}

/**
 * Validate all passengers in an array
 */
export const validatePassengers = (passengers) => {
  const allErrors = []
  let   allValid  = true
  passengers.forEach((p, i) => {
    const result = validatePassenger(p, i)
    if (!result.valid) {
      allValid = false
      allErrors.push(...Object.values(result.errors))
    }
  })
  return { valid: allValid, errors: allErrors }
}

/**
 * Validate a flight search form
 */
export const validateFlightSearch = ({ from, to, departureDate, travelers }) => {
  const errors = {}
  if (!from?.trim())         errors.from          = 'Origin city is required'
  if (!to?.trim())           errors.to            = 'Destination city is required'
  if (from === to)           errors.to            = 'Origin and destination cannot be the same'
  if (!departureDate)        errors.departureDate = 'Departure date is required'
  else {
    const d = new Date(departureDate)
    const today = new Date(); today.setHours(0,0,0,0)
    if (d < today)           errors.departureDate = 'Departure date cannot be in the past'
  }
  if (!travelers || travelers < 1 || travelers > 9)
    errors.travelers = 'Travelers must be between 1 and 9'
  return { valid: Object.keys(errors).length === 0, errors }
}

/**
 * Validate a profile update form
 */
export const validateProfileUpdate = ({ name, phone }) => {
  const errors = {}
  if (!name?.trim() || name.trim().length < 2)
    errors.name = 'Name must be at least 2 characters'
  if (phone && !isValidPhone(phone))
    errors.phone = 'Enter a valid 10-digit mobile number'
  return { valid: Object.keys(errors).length === 0, errors }
}

/**
 * Validate a coupon code format (alphanumeric, 4–20 chars)
 */
export const isValidCouponCode = (code) => {
  return /^[A-Z0-9]{4,20}$/.test(String(code).trim().toUpperCase())
}

/**
 * Check if a date string is in the future
 */
export const isFutureDate = (dateStr) => {
  if (!dateStr) return false
  return new Date(dateStr) > new Date()
}

/**
 * Check if a date string is today or in the future
 */
export const isTodayOrFuture = (dateStr) => {
  if (!dateStr) return false
  const d = new Date(dateStr); d.setHours(0,0,0,0)
  const t = new Date();        t.setHours(0,0,0,0)
  return d >= t
}
