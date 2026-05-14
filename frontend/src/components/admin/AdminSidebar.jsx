// components/admin/AdminSidebar.jsx
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Plane, BookOpen, Users, Tag, BarChart2, X } from 'lucide-react'

const links = [
  { path:'/admin',          icon: LayoutDashboard, label:'Dashboard'  },
  { path:'/admin/flights',  icon: Plane,           label:'Flights'    },
  { path:'/admin/bookings', icon: BookOpen,         label:'Bookings'   },
  { path:'/admin/users',    icon: Users,            label:'Users'      },
  { path:'/admin/revenue',  icon: BarChart2,        label:'Revenue'    },
]

const AdminSidebar = ({ mobileOpen, onClose }) => {
  const location = useLocation()
  const isActive = (path) => path === '/admin' ? location.pathname === path : location.pathname.startsWith(path)

  const Content = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><Plane className="w-4 h-4 text-white" /></div>
          <div><p className="font-bold text-gray-900 text-sm">SkyJourney</p><p className="text-xs text-gray-400">Admin Panel</p></div>
        </div>
        {onClose && <button onClick={onClose} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>}
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(link => (
          <Link key={link.path} to={link.path} onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive(link.path) ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <link.icon className="w-4 h-4 flex-shrink-0" />
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="px-3 pb-4">
        <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">← Back to Site</Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-56 flex-shrink-0 bg-white border-r border-gray-100 flex-col h-screen sticky top-0"><Content /></aside>
      {/* Mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-white flex flex-col shadow-2xl"><Content /></aside>
        </div>
      )}
    </>
  )
}

export default AdminSidebar
