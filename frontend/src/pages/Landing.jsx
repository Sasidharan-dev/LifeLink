import { Link } from 'react-router-dom'
import { Heart, Search, Bell, Shield, ArrowRight, Droplets, Users, Activity, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const { dark, toggle } = useTheme()
  const { user, loading } = useAuth()

  return (
    <div className="min-h-screen overflow-hidden bg-[#0a0a0a] text-white transition-colors duration-300">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blood-900/20 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 h-64 w-64 rounded-full bg-blood-800/10 blur-3xl" />
        <div className="absolute inset-0 bg-noise opacity-50" />
      </div>

      <nav className="relative z-10 flex items-center justify-between border-b border-white/5 px-6 py-5 lg:px-12">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blood-500 to-blood-800">
            <Heart size={16} className="fill-white text-white" />
          </div>
          <span className="font-display text-xl font-bold">LifeLink</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 transition-colors hover:border-white/20 hover:text-white"
          >
            {dark ? <Sun size={14} /> : <Moon size={14} />}
            {dark ? 'Light' : 'Dark'}
          </button>
          {loading ? (
            <div className="h-11 w-32 rounded-2xl border border-white/10 bg-white/5" />
          ) : user ? (
            <>
              <Link to="/dashboard" className="px-4 py-2 text-sm text-gray-400 transition-colors hover:text-white">
                Dashboard
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 transition-all hover:border-white/20"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blood-600 to-blood-900 text-sm font-bold text-white">
                  {user?.name?.[0]?.toUpperCase() || 'L'}
                </span>
                <span className="max-w-[140px] truncate text-sm font-semibold text-white">{user?.name || 'LifeLink User'}</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-sm text-gray-400 transition-colors hover:text-white">
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-blood-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blood-600"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-20 text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blood-800/50 bg-blood-900/30 px-4 py-2 text-sm font-medium text-blood-300">
          <Droplets size={14} className="fill-blood-400 text-blood-400" />
          Smart Blood Donation Network
        </div>

        <h1 className="mb-6 font-display text-5xl font-extrabold leading-[1.05] lg:text-7xl">
          Every Drop <br />
          <span className="text-gradient">Saves a Life.</span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-400 lg:text-xl">
          Connect donors, hospitals, and families instantly with emergency-first blood matching, location-aware search,
          and live donor readiness.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to={user ? '/donors' : '/register'}
            className="flex items-center gap-2 rounded-xl bg-blood-700 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-blood-600 hover:shadow-lg hover:shadow-blood-900/50"
          >
            {user ? 'Browse Donors' : 'Register as Donor'} <ArrowRight size={16} />
          </Link>
          <Link
            to={user ? '/requests/new' : '/login'}
            className="flex items-center gap-2 rounded-xl border border-white/15 px-7 py-3.5 text-sm font-semibold text-gray-300 transition-all hover:border-white/30 hover:text-white"
          >
            {user ? 'Request Blood Now' : 'Find Blood Now'}
          </Link>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { icon: Users, value: 'Smart', label: 'Matched Donors' },
            { icon: Droplets, value: '24/7', label: 'Emergency Readiness' },
            { icon: Activity, value: '90 Days', label: 'Eligibility Tracking' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="glass-card p-6 text-center">
              <Icon size={22} className="mx-auto mb-3 text-blood-500" />
              <div className="font-display text-3xl font-bold text-white">{value}</div>
              <div className="mt-1 text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24">
        <h2 className="mb-12 text-center font-display text-3xl font-bold">Built for Real Emergencies</h2>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Search, title: 'Friends2Support Search', desc: 'Filter donors by blood group, state, district, city, and real-time availability.' },
            { icon: Bell, title: 'Emergency Alerts', desc: 'High-priority requests surface instantly with ranked donor matches and stronger visibility.' },
            { icon: Shield, title: 'Eligibility Engine', desc: 'Age, weight, health, and 90-day donation windows are tracked automatically.' },
            { icon: Heart, title: 'Near Me Discovery', desc: 'Use geolocation to spot nearby donors when time matters most.' },
            { icon: Activity, title: 'Operational Dashboard', desc: 'Track donor readiness, emergency demand, recent requests, and completion rates.' },
            { icon: Users, title: 'Direct Contact', desc: 'Call or WhatsApp matched donors instantly without digging through profiles.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card group p-5 transition-all hover:border-blood-800/60">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-blood-800/30 bg-blood-900/40 transition-colors group-hover:bg-blood-900/60">
                <Icon size={18} className="text-blood-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">{title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-2xl px-6 pb-24 text-center">
        <div className="glass-card border-blood-900/50 p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blood-500 to-blood-800 shadow-lg shadow-blood-900/50">
            <Heart size={24} className="fill-white text-white" />
          </div>
          <h2 className="mb-3 font-display text-3xl font-bold">Ready to Save a Life?</h2>
          <p className="mb-6 text-gray-400">Create your account and turn LifeLink into a live response network for your city.</p>
          <Link
            to={user ? '/dashboard' : '/register'}
            className="inline-flex items-center gap-2 rounded-xl bg-blood-700 px-8 py-3.5 font-semibold text-white transition-all hover:bg-blood-600 hover:shadow-lg hover:shadow-blood-900/50"
          >
            {user ? 'Open Dashboard' : 'Join LifeLink Today'} <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
