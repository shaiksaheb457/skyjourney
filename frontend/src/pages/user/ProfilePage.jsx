// pages/user/ProfilePage.jsx
import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { User, Mail, Phone, Camera, Save, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar  from '../../components/common/Navbar'
import Footer  from '../../components/common/Footer'
import { updateProfile } from '../../services/authService'
import { updateUser, selectUser } from '../../store/slices/authSlice'
import api from '../../services/api'

const ProfilePage = () => {
  const dispatch    = useDispatch()
  const user        = useSelector(selectUser)
  const [isLoading, setIsLoading]   = useState(false)
  const [showPwdForm, setShowPwdForm] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]       = useState(false)

  const [form, setForm] = useState({ name: user?.name||'', phone: user?.phone||'' })
  const [pwdForm, setPwdForm] = useState({ currentPassword:'', newPassword:'' })

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Name is required')
    setIsLoading(true)
    try {
      const data = await updateProfile(form)
      dispatch(updateUser(data.data.user))
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally { setIsLoading(false) }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!pwdForm.currentPassword) return toast.error('Enter current password')
    if (pwdForm.newPassword.length < 6) return toast.error('New password must be at least 6 characters')
    setIsLoading(true)
    try {
      await api.post('/auth/change-password', pwdForm)
      toast.success('Password changed successfully!')
      setPwdForm({ currentPassword:'', newPassword:'' })
      setShowPwdForm(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally { setIsLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

        {/* Avatar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50">
                <Camera className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium mt-1 inline-block capitalize ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Edit profile form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <h3 className="text-base font-bold text-gray-900 mb-5">Personal Information</h3>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={user?.email} disabled
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
              </div>
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={form.phone} onChange={e => setForm(p=>({...p,phone:e.target.value}))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
            </div>
            <button type="submit" disabled={isLoading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all text-sm disabled:opacity-60">
              <Save className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Security</h3>
            <button onClick={() => setShowPwdForm(!showPwdForm)}
              className="text-sm text-blue-600 font-medium hover:text-blue-700">
              {showPwdForm ? 'Cancel' : 'Change Password'}
            </button>
          </div>
          {!showPwdForm ? (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Lock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Password: ••••••••••</span>
            </div>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showCurrent ? 'text' : 'password'} value={pwdForm.currentPassword}
                    onChange={e => setPwdForm(p=>({...p,currentPassword:e.target.value}))}
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showNew ? 'text' : 'password'} value={pwdForm.newPassword}
                    onChange={e => setPwdForm(p=>({...p,newPassword:e.target.value}))}
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-60">
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ProfilePage
