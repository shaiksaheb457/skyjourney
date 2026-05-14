// pages/auth/RegisterPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Eye, EyeOff, Mail, Lock, User, Phone, Plane, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { setCredentials } from '../../store/slices/authSlice'
import { register } from '../../services/authService'

const RegisterPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword]   = useState(false)
  const [showConfirm, setShowConfirm]     = useState(false)
  const [isLoading, setIsLoading]         = useState(false)
  const [errors, setErrors]               = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Full name is required'
    else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters'
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email'
    if (!formData.phone) newErrors.phone = 'Phone number is required'
    else if (!/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = 'Enter a valid 10-digit Indian number'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'At least 6 characters'
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    try {
      const { confirmPassword, ...submitData } = formData
      const data = await register(submitData)
      dispatch(setCredentials({ user: data.data.user, token: data.data.token }))
      toast.success(`Welcome to SkyJourney, ${data.data.user.name}! 🎉`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Password strength indicator
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { strength: 0, label: '', color: '' }
    let score = 0
    if (pwd.length >= 6)  score++
    if (pwd.length >= 10) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    if (score <= 1) return { strength: score, label: 'Weak',   color: 'bg-red-400' }
    if (score <= 3) return { strength: score, label: 'Medium', color: 'bg-yellow-400' }
    return               { strength: score, label: 'Strong',  color: 'bg-green-400' }
  }
  const pwdStrength = getPasswordStrength(formData.password)

  const benefits = ['No hidden charges', 'Instant booking confirmation', 'Free cancellation on select flights', '24/7 customer support']

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12 relative overflow-hidden" style={{background:'linear-gradient(135deg,#0f2645 0%,#1a3a6e 50%,#1e6bb8 100%)'}}>
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full" style={{background:'rgba(255,255,255,0.05)'}} />
        <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full" style={{background:'rgba(255,255,255,0.05)'}} />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'rgba(255,255,255,0.2)'}}>
            <Plane className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-2xl font-bold">SkyJourney</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">Join millions of happy travelers</h2>
          <p className="text-blue-200 text-base leading-relaxed mb-8">Create your free account and start exploring the world at unbeatable prices.</p>
          <div className="space-y-4">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-white/90 text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-5 relative z-10" style={{background:'rgba(255,255,255,0.1)'}}>
          <div className="flex items-center gap-4">
            <div className="text-center"><div className="text-2xl font-bold text-white">4.9★</div><div className="text-blue-300 text-xs mt-1">App Rating</div></div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center"><div className="text-2xl font-bold text-white">2M+</div><div className="text-blue-300 text-xs mt-1">Downloads</div></div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center"><div className="text-2xl font-bold text-white">500+</div><div className="text-blue-300 text-xs mt-1">Airlines</div></div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-6 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><Plane className="w-4 h-4 text-white" /></div>
            <span className="text-blue-900 text-xl font-bold">SkyJourney</span>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 mt-2">Join SkyJourney and explore the world</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your full name"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">⚠ {errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">⚠ {errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <div className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium border-r border-gray-200 pr-3">+91</div>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="9876543210" maxLength="10"
                  className={`w-full pl-24 pr-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">⚠ {errors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Create a strong password"
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= pwdStrength.strength ? pwdStrength.color : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">Strength: <span className="font-medium">{pwdStrength.label}</span></p>
                </div>
              )}
              {errors.password && <p className="text-red-500 text-xs mt-1">⚠ {errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat your password"
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.confirmPassword ? 'border-red-400 bg-red-50' : formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-green-400' : 'border-gray-200'}`} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">⚠ {errors.confirmPassword}</p>}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="text-green-500 text-xs mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Passwords match</p>
              )}
            </div>

            <p className="text-xs text-gray-500 pt-1">
              By registering, you agree to our{' '}
              <span className="text-blue-600 cursor-pointer hover:underline">Terms of Service</span> and{' '}
              <span className="text-blue-600 cursor-pointer hover:underline">Privacy Policy</span>.
            </p>

            <button type="submit" disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed">
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</>
              ) : (
                <><Plane className="w-4 h-4" />Create My Account</>
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <p className="text-center text-gray-600 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
