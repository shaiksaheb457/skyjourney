// pages/auth/ForgotPasswordPage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Plane, ArrowLeft, KeyRound, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { forgotPassword, verifyOTP, resetPassword } from '../../services/authService'

const ForgotPasswordPage = () => {
  const [step, setStep]         = useState(1) // 1=email, 2=otp, 3=newpassword, 4=done
  const [email, setEmail]       = useState('')
  const [otp, setOtp]           = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Please enter your email')
    setIsLoading(true)
    try {
      await forgotPassword(email)
      toast.success('OTP sent to your email!')
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP')
    } finally { setIsLoading(false) }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) return toast.error('Enter the 6-digit OTP')
    setIsLoading(true)
    try {
      await verifyOTP(email, otp)
      toast.success('OTP verified!')
      setStep(3)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
    } finally { setIsLoading(false) }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    setIsLoading(true)
    try {
      await resetPassword(email, otp, newPassword)
      toast.success('Password reset successfully!')
      setStep(4)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password')
    } finally { setIsLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Plane className="w-4 h-4 text-white" />
          </div>
          <span className="text-blue-900 text-xl font-bold">SkyJourney</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Progress steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {['Email','OTP','New Password'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step > i+1 ? 'bg-green-500 text-white' : step === i+1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {step > i+1 ? '✓' : i+1}
                </div>
                <span className={`text-xs hidden sm:block ${step === i+1 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>{s}</span>
                {i < 2 && <div className={`w-8 h-px ${step > i+1 ? 'bg-green-400' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-7 h-7 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Forgot password?</h1>
                <p className="text-gray-500 mt-2 text-sm">Enter your email and we'll send you an OTP</p>
              </div>
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                  {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</> : 'Send OTP'}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-7 h-7 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Enter OTP</h1>
                <p className="text-gray-500 mt-2 text-sm">We sent a 6-digit code to <strong>{email}</strong></p>
              </div>
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="Enter 6-digit OTP" maxLength="6"
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl font-bold tracking-widest" />
                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                  {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying...</> : 'Verify OTP'}
                </button>
                <button type="button" onClick={() => setStep(1)} className="w-full text-gray-500 text-sm hover:text-gray-700 flex items-center justify-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Change email
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-7 h-7 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">New Password</h1>
                <p className="text-gray-500 mt-2 text-sm">Create a strong new password</p>
              </div>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                  {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Resetting...</> : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          {step === 4 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">All done!</h1>
              <p className="text-gray-500 text-sm mb-6">Your password has been reset successfully.</p>
              <Link to="/login" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
                <Plane className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Remember your password?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
