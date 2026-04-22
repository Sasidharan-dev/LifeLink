import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  LayoutDashboard,
  Users,
  Droplets,
  MessageCircle,
  Shield,
  LogOut,
  Menu,
  Home,
  Sun,
  Moon,
  Heart,
} from 'lucide-react'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/donors', icon: Users, label: 'Donors' },
  { to: '/requests', icon: Droplets, label: 'Blood Requests' },
  { to: '/messages', icon: MessageCircle, label: 'Messages' },
]

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-white/8 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blood-500 to-blood-800 shadow-lg shadow-blood-900/50">
          <Heart size={18} className="fill-white text-white" />
        </div>
        <div>
          <span className="font-display text-lg font-bold tracking-tight text-white">LifeLink</span>
          <p className="-mt-0.5 text-[10px] uppercase tracking-widest text-gray-500">Blood Network</p>
        </div>
      </div>

      <nav className="scrollbar-hide flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-4 text-[10px] uppercase tracking-widest text-gray-600">Menu</p>
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <p className="mb-2 mt-4 px-4 text-[10px] uppercase tracking-widest text-gray-600">Admin</p>
            <NavLink
              to="/admin"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Shield size={17} />
              <span>Admin Panel</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="space-y-1 border-t border-white/8 px-3 pb-4 pt-3">
        <button onClick={toggle} className="sidebar-link w-full">
          {dark ? <Sun size={17} /> : <Moon size={17} />}
          <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-400 hover:bg-red-900/20 hover:text-red-300"
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>

        <div className="mt-1 flex items-center gap-3 rounded-xl bg-white/4 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blood-600 to-blood-900 text-sm font-bold text-white">
            {user?.name?.[0]?.toUpperCase() || 'L'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user?.name || 'LifeLink User'}</p>
            <p className="truncate text-[11px] text-gray-500">{user?.role || 'Member'}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="app-shell flex h-screen overflow-hidden">
      <aside className="sidebar-surface hidden w-60 shrink-0 border-r border-white/6 lg:flex lg:flex-col">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="sidebar-surface absolute bottom-0 left-0 top-0 z-10 w-64 border-r border-white/6">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sidebar-surface flex items-center justify-between border-b border-white/6 px-4 py-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-gray-400 hover:bg-white/8">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Heart size={16} className="fill-blood-500 text-blood-500" />
            <span className="font-display font-bold text-white">LifeLink</span>
          </div>
          <button onClick={toggle} className="rounded-lg p-2 text-gray-400 hover:bg-white/8">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
