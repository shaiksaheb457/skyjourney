// pages/admin/AdminUsers.jsx
import { useState, useEffect } from 'react'
import { Menu, Search, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { getAllUsersAdmin, toggleUserStatus } from '../../services/adminService'

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '--'

const AdminUsers = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [users, setUsers]           = useState([])
  const [isLoading, setIsLoading]   = useState(true)
  const [search, setSearch]         = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllUsersAdmin({ page:1, limit:50 })
        setUsers(data.data.users || [])
      } catch { toast.error('Failed to load users') }
      finally { setIsLoading(false) }
    }
    load()
  }, [])

  const handleToggle = async (userId) => {
    try {
      const data = await toggleUserStatus(userId)
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: data.data.user.isActive } : u))
      toast.success('User status updated')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update') }
  }

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg"><Menu className="w-5 h-5 text-gray-600" /></button>
          <h1 className="text-lg font-bold text-gray-900 flex-1">Manage Users</h1>
          <span className="text-sm text-gray-500">{filtered.length} users</span>
        </header>
        <main className="flex-1 p-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{['User','Email','Phone','Role','Joined','Status','Action'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? Array.from({length:5}).map((_,i) => (
                    <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" /></td></tr>
                  )) : filtered.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold">{u.name?.charAt(0)}</div>
                          <span className="font-medium text-gray-900">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{u.email}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{u.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${u.role==='admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.role !== 'admin' && (
                          <button onClick={() => handleToggle(u._id)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                            {u.isActive ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminUsers
