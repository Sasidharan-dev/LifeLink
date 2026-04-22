import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Droplets,
  Activity,
  AlertTriangle,
  Plus,
  ArrowRight,
  Clock,
  MapPin,
  Phone,
  Home,
  HeartHandshake,
} from 'lucide-react'
import { dashboardAPI, donorAPI, requestAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  EmptyState,
  PageHeader,
  SimpleBarChart,
  SkeletonCard,
  UrgencyBadge,
  BloodGroupPill,
} from '../components/ui'
import { formatDate, getApiData, getErrorMessage } from '../utils/app'
import toast from 'react-hot-toast'

function CountUpNumber({ value }) {
  const numericValue = Number(value)
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!Number.isFinite(numericValue)) {
      return
    }

    let frameId = 0
    let startTime = 0
    const duration = 700

    const step = (timestamp) => {
      if (!startTime) {
        startTime = timestamp
      }
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setDisplayValue(Math.round(numericValue * progress))
      if (progress < 1) {
        frameId = window.requestAnimationFrame(step)
      }
    }

    frameId = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(frameId)
  }, [numericValue])

  return <>{Number.isFinite(numericValue) ? displayValue : value}</>
}

function StatCard({ icon: Icon, label, value, sub, color = 'blood', loading }) {
  const colors = {
    blood: 'from-blood-900/50 to-blood-950/30 border-blood-800/40 text-blood-400',
    emerald: 'from-emerald-900/50 to-emerald-950/30 border-emerald-800/40 text-emerald-400',
    amber: 'from-amber-900/50 to-amber-950/30 border-amber-800/40 text-amber-400',
    red: 'from-red-900/60 to-red-950/40 border-red-700/50 text-red-400',
  }
  const iconStyles = {
    blood: 'bg-red-100 text-red-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-rose-100 text-rose-600',
  }

  return (
    <div className={`stat-card rounded-2xl border bg-gradient-to-br p-5 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] ${colors[color]}`}>
      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-8 w-8 rounded-lg bg-white/10" />
          <div className="h-7 w-16 rounded bg-white/10" />
          <div className="h-3 w-24 rounded bg-white/10" />
        </div>
      ) : (
        <>
          <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl ${iconStyles[color]}`}>
            <Icon size={22} />
          </div>
          <div className="font-display text-3xl font-bold text-white"><CountUpNumber value={value} /></div>
          <div className="mt-0.5 text-sm font-semibold tracking-wide text-white/70">{label}</div>
          {sub && <div className="mt-1 text-xs text-white/40">{sub}</div>}
        </>
      )}
    </div>
  )
}

function EmergencyCard({ req }) {
  return (
    <div className="glass-card animate-pulse border-red-900/50 bg-red-950/20 p-4 transition-all hover:border-red-700/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <BloodGroupPill group={req?.bloodGroup} />
          <div>
            <div className="mb-0.5 flex items-center gap-2">
              <UrgencyBadge urgency={req?.urgency} />
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
              <MapPin size={11} /> {req?.location || 'Location pending'}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400">
              <Phone size={11} /> {req?.contact || 'No contact provided'}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-xs text-gray-500">
          <Clock size={11} />
          {formatDate(req?.createdAt)}
        </div>
      </div>
      {req?.notes && <p className="mt-3 border-l border-red-800/40 pl-1 text-xs italic text-gray-500">{req.notes}</p>}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [donors, setDonors] = useState([])
  const [requests, setRequests] = useState([])
  const [emergencies, setEmergencies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true)

      try {
        const [statsRes, donorsRes, requestsRes, emergencyRes] = await Promise.all([
          dashboardAPI.getStats(),
          donorAPI.getAll(),
          requestAPI.getAll(),
          requestAPI.getEmergency(),
        ])

        setStats(getApiData(statsRes, {}))
        setDonors(getApiData(donorsRes, []))
        setRequests(getApiData(requestsRes, []))
        setEmergencies(getApiData(emergencyRes, []))
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to load dashboard'))
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.name?.split(' ')?.[0] || 'there'

  const availabilityChart = [
    { label: 'Available donors', value: donors.filter(donor => donor?.availability).length, color: 'from-emerald-500 to-emerald-400' },
    { label: 'Unavailable donors', value: donors.filter(donor => donor?.availability === false).length, color: 'from-slate-400 to-slate-500' },
  ]

  const requestStatusChart = ['PENDING', 'FULFILLED', 'COMPLETED', 'CANCELLED'].map(status => ({
    label: status[0] + status.slice(1).toLowerCase(),
    value: requests.filter(request => request?.status === status).length,
    color: {
      PENDING: 'from-amber-500 to-amber-400',
      FULFILLED: 'from-blue-500 to-blue-400',
      COMPLETED: 'from-emerald-500 to-emerald-400',
      CANCELLED: 'from-slate-500 to-slate-400',
    }[status],
  }))

  const bloodGroupChart = useMemo(() => ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => ({
    label: group,
    value: donors.filter(donor => donor?.bloodGroup === group).length,
  })).filter(item => item.value > 0), [donors])

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title={`${greeting}, ${firstName}`}
        subtitle="Here’s the live operational view of your LifeLink network."
        action={
          <Link to="/" className="btn-ghost inline-flex items-center gap-2 rounded-xl border border-white/12 text-sm">
            <Home size={15} />
            Home
          </Link>
        }
      />

      {stats?.criticalRequests > 0 && (
        <div className="glass-card flex items-center gap-3 border-red-800/50 bg-red-950/20 p-4">
          <AlertTriangle size={18} className="text-red-400" />
          <div>
            <p className="font-semibold text-red-200">Critical requests need immediate action</p>
            <p className="text-sm text-red-200/80">{stats.criticalRequests} critical request(s) are still pending right now.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard icon={Users} label="Total Donors" value={stats?.totalDonors ?? '--'} color="blood" loading={loading} />
        <StatCard icon={Activity} label="Active Donors" value={stats?.activeDonors ?? '--'} color="emerald" loading={loading} sub={`${stats?.eligibleDonors ?? 0} eligible`} />
        <StatCard icon={HeartHandshake} label="Eligible Donors" value={stats?.eligibleDonors ?? '--'} color="emerald" loading={loading} />
        <StatCard icon={Droplets} label="Requests" value={stats?.totalRequests ?? '--'} color="amber" loading={loading} sub={`${stats?.recentRequests ?? 0} in last 7 days`} />
        <StatCard icon={AlertTriangle} label="Emergencies" value={stats?.emergencyRequests ?? '--'} color="red" loading={loading} sub={`${stats?.criticalRequests ?? 0} critical`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/donors" className="glass-card group flex items-center justify-between p-5 transition-all hover:border-blood-800/60">
          <div>
            <p className="mb-1 text-xs uppercase tracking-widest text-gray-500">Find</p>
            <p className="text-lg font-semibold text-white">Blood Donors</p>
            <p className="mt-1 text-xs text-gray-400">Search by location, blood group, availability, and eligibility</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blood-800/30 bg-blood-900/40 transition-colors group-hover:bg-blood-900/60">
            <Users size={20} className="text-blood-400" />
          </div>
        </Link>
        <Link to="/requests/new" className="glass-card group flex items-center justify-between p-5 transition-all hover:border-blood-800/60">
          <div>
            <p className="mb-1 text-xs uppercase tracking-widest text-gray-500">Create</p>
            <p className="text-lg font-semibold text-white">Blood Request</p>
            <p className="mt-1 text-xs text-gray-400">Post urgent blood needs with automatic donor ranking</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blood-800/30 bg-blood-900/40 transition-colors group-hover:bg-blood-900/60">
            <Plus size={20} className="text-blood-400" />
          </div>
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-400" />
              <h2 className="font-display font-semibold text-white">Emergency Requests</h2>
            </div>
            <Link to="/requests" className="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-white">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[...Array(2)].map((_, index) => <SkeletonCard key={index} />)}
            </div>
          ) : emergencies.length === 0 ? (
            <EmptyState icon={Activity} title="No active emergencies" description="The network is calm right now. Check the requests board for routine cases." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {emergencies.slice(0, 4).map(request => (
                <EmergencyCard key={request?.id} req={request} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">Donor Availability</h3>
              <span className="text-xs text-gray-500">{donors.length} donor profiles</span>
            </div>
            <SimpleBarChart items={availabilityChart} />
          </div>

          <div className="glass-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">Request Status Mix</h3>
              <span className="text-xs text-gray-500">{requests.length} requests tracked</span>
            </div>
            <SimpleBarChart items={requestStatusChart} />
          </div>

          <div className="glass-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">Blood Group Coverage</h3>
              <span className="text-xs text-gray-500">Live donor mix</span>
            </div>
            <SimpleBarChart items={bloodGroupChart} emptyLabel="No donor blood groups available yet" />
          </div>
        </div>
      </div>

      {stats && (
        <div className="glass-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">Request Fulfilment Rate</h3>
            <span className="text-xs text-gray-400">
              {stats.completedRequests || 0} / {stats.totalRequests || 0} completed
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blood-700 to-blood-500 transition-all duration-1000"
              style={{ width: `${stats.totalRequests ? Math.round((stats.completedRequests / stats.totalRequests) * 100) : 0}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span className="font-semibold text-blood-400">
              {stats.totalRequests ? Math.round((stats.completedRequests / stats.totalRequests) * 100) : 0}%
            </span>
            <span>100%</span>
          </div>
        </div>
      )}
    </div>
  )
}
