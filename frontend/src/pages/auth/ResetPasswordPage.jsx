// pages/auth/ResetPasswordPage.jsx — OTP verification + new password form
import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Lock, KeyRound, CheckCircle, Plane } from 'lucide-react'
import toast from 'react-hot-toast'
import { verifyOTP, resetPassword } from '../../services/authService'
import { validatePassword } from '../../utils/validators'

const STEPS = { OTP: 'otp', PASSWORD: 'password', SUCCESS: 'success' }

const ResetPasswordPage = () => {
  const navigate  = useNavigate()
  const location  = useLocation()

  // Email passed via router state from ForgotPasswordPage
  const email = location.state?.email || ''

  const [step, setStep]           = useState(STEPS.OTP)
  const [otp, setOtp]             = useState(['', '', '', '', '', ''])
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [showCf, setShowCf]       = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // ── Step 1: verify OTP ──────────────────────────────────────────
  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return
    const updated = [...otp]
    updated[idx] = val
    setOtp(updated)
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus()
    }
  }

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus()
    }
  }

  const handleVerifyOtp = async () => {
    const code = otp.join('')
    if (code.length < 6) return toast.error('Enter all 6 digits')
    setIsLoading(true)
    try {
      await verifyOTP(email, code)
      setStep(STEPS.PASSWORD)
      toast.success('OTP verified!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Step 2: set new password ────────────────────────────────────
  const handleResetPassword = async () => {
    const { valid, errors } = validatePassword(password)
    if (!valid) return toast.error(errors[0])
    if (password !== confirm) return toast.error('Passwords do not match')
    setIsLoading(true)
    try {
      await resetPassword(email, otp.join(''), password)
      setStep(STEPS.SUCCESS)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  const InputRow = ({ icon: Icon, type, value, onChange, placeholder, show, onToggle }) => (
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type={show !== undefined ? (show ? 'text' : 'password') : type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {onToggle && (
        <button type="button" onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="text-blue-900 text-2xl font-bold">SkyJourney</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* ── OTP Step ── */}
          {step === STEPS.OTP && (
            <>
              <div className="text-center mb-7">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-6 h-6 text-blue-600" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Enter OTP</h1>
                <p className="text-sm text-gray-500 mt-1">
                  We sent a 6-digit code to <strong>{email}</strong>
                </p>
              </div>

              {/* OTP input boxes */}
              <div className="flex items-center justify-center gap-3 mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    className={`w-11 h-12 text-center text-lg font-bold border-2 rounded-xl focus:outline-none transition-all ${
                      digit ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 focus:border-blue-400'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={isLoading || otp.join('').length < 6}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying…
                  </span>
                ) : 'Verify OTP'}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Didn't receive it?{' '}
                <Link to="/forgot-password" className="text-blue-600 font-medium hover:underline">
                  Resend OTP
                </Link>
              </p>
            </>
          )}

          {/* ── New Password Step ── */}
          {step === STEPS.PASSWORD && (
            <>
              <div className="text-center mb-7">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 text-blue-600" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">New Password</h1>
                <p className="text-sm text-gray-500 mt-1">Choose a strong password for your account</p>
              </div>

              <div className="space-y-4 mb-6">
                <InputRow
                  icon={Lock} value={password} onChange={setPassword}
                  placeholder="New password" show={showPw} onToggle={() => setShowPw(!showPw)}
                />
                <InputRow
                  icon={Lock} value={confirm} onChange={setConfirm}
                  placeholder="Confirm new password" show={showCf} onToggle={() => setShowCf(!showCf)}
                />

                {/* Password hints */}
                <ul className="text-xs text-gray-400 space-y-1 pl-1">
                  {[
                    [/.{8,}/, 'At least 8 characters'],
                    [/[A-Z]/, 'One uppercase letter'],
                    [/[a-z]/, 'One lowercase letter'],
                    [/\d/,    'One number'],
                  ].map(([regex, hint]) => (
                    <li key={hint} className={`flex items-center gap-1.5 ${regex.test(password) ? 'text-green-600' : ''}`}>
                      <span>{regex.test(password) ? '✓' : '○'}</span> {hint}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleResetPassword}
                disabled={isLoading || !password || !confirm}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Resetting…
                  </span>
                ) : 'Reset Password'}
              </button>
            </>
          )}

          {/* ── Success Step ── */}
          {step === STEPS.SUCCESS && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-9 h-9 text-green-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Password Reset!</h1>
              <p className="text-sm text-gray-500 mb-6">
                Your password has been updated successfully. You can now sign in.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
