import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Receipt, Users, LogOut,
  TrendingUp, User, ChevronRight
} from 'lucide-react'

const navItems = [
  { to: '/',        icon: LayoutDashboard, label: 'Dashboard',  analyst: true },
  { to: '/records', icon: Receipt,         label: 'Records',    analyst: false },
  { to: '/users',   icon: Users,           label: 'Users',      admin: true },
  { to: '/profile', icon: User,            label: 'Profile',    analyst: false },
]

const RoleBadge = ({ role }) => {
  const map = { admin: 'badge-admin', analyst: 'badge-analyst', viewer: 'badge-viewer' }
  return <span className={map[role] || 'badge-viewer'}>{role}</span>
}

export default function Layout() {
  const { user, logout, isAdmin, isAnalyst } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const visible = navItems.filter(item => {
    if (item.admin   && !isAdmin)   return false
    if (item.analyst && !isAnalyst) return false
    return true
  })

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-surface-100 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-surface-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-surface-900 text-lg tracking-tight">FinanceOS</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {visible.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-surface-500 hover:text-surface-900 hover:bg-surface-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-surface-400 group-hover:text-surface-600'}`} />
                  {label}
                  {isActive && <ChevronRight className="w-3 h-3 ml-auto text-brand-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-surface-100">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-50 mb-1">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-surface-900 truncate">{user?.name}</p>
              <RoleBadge role={user?.role} />
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-500 hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
