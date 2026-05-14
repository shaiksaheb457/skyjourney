// pages/auth/LoginPage.jsx
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Eye, EyeOff, Mail, Lock, Plane } from 'lucide-react'
import toast from 'react-hot-toast'
import { setCredentials } from '../../store/slices/authSlice'
import { login } from '../../services/authService'

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [formData, setFormData]         = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading]       = useState(false)
  const [errors, setErrors]             = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'At least 6 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    try {
      const data = await login(formData)
      dispatch(setCredentials({ user: data.data.user, token: data.data.token }))
      toast.success(`Welcome back, ${data.data.user.name}! ✈️`)
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden" style={{background:'linear-gradient(135deg,#0f2645 0%,#1a3a6e 50%,#1e6bb8 100%)'}}>
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full" style={{background:'rgba(255,255,255,0.05)'}} />
        <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full" style={{background:'rgba(255,255,255,0.05)'}} />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'rgba(255,255,255,0.2)'}}>
            <Plane className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-2xl font-bold">SkyJourney</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-5xl font-bold text-white leading-tight mb-6">Your journey<br />starts here ✈️</h2>
          <p className="text-blue-200 text-lg leading-relaxed mb-10">
            Book flights to 500+ destinations at the best prices. Fast, secure, and hassle-free.
          </p>
          <div className="grid grid-cols-3 gap-6">
            {[{value:'500+',label:'Destinations'},{value:'2M+',label:'Happy Travelers'},{value:'24/7',label:'Support'}].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-white">{s.value}</div>
                <div className="text-blue-300 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-5 relative z-10" style={{background:'rgba(255,255,255,0.1)'}}>
          <p className="text-white text-sm leading-relaxed">"Booked my Dubai trip in under 5 minutes. Amazing experience!"</p>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{background:'linear-gradient(135deg,#f59e0b,#f97316)'}}>P</div>
            <div>
              <div className="text-white text-sm font-medium">Priya S.</div>
              <div className="text-blue-300 text-xs">Frequent Flyer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Plane className="w-4 h-4 text-white" />
            </div>
            <span className="text-blue-900 text-xl font-bold">SkyJourney</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-gray-500 mt-2">Sign in to continue booking amazing flights</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">⚠ {errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password"
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">⚠ {errors.password}</p>}
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed mt-2">
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
              ) : (
                <><Plane className="w-4 h-4" />Sign In</>
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <p className="text-center text-gray-600 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700">Create one free →</Link>
          </p>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-xs text-blue-700 font-medium mb-1">🧪 Test credentials</p>
            <p className="text-xs text-blue-600">Email: manogna@test.com</p>
            <p className="text-xs text-blue-600">Password: 123456</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
