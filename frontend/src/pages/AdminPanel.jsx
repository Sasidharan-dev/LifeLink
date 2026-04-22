import { useCallback, useEffect, useState } from 'react'
import { Shield, Users, Droplets, Trash2, RefreshCw, AlertTriangle, ClipboardList } from 'lucide-react'
import { adminAPI } from '../services/api'
import {
  PageHeader,
  Badge,
  BloodGroupPill,
  UrgencyBadge,
  StatusBadge,
  EmptyState,
} from '../components/ui'
import { formatDate, getApiData, getErrorMessage } from '../utils/app'
import toast from 'react-hot-toast'

const ROLE_COLORS = {
  ADMIN: 'danger',
  DONOR: 'blood',
  PATIENT: 'info',
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative glass-card p-6 max-w-sm w-full animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-900/40 border border-red-800/40 flex items-center justify-center">
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Confirm Delete</h3>
            <p className="text-xs text-gray-400 mt-0.5">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-gray-300 mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-white/12 text-gray-300 text-sm font-semibold hover:border-white/20 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white text-sm font-semibold transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPanel() {
  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState([])
  const [donors, setDonors] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [usersResponse, donorsResponse, requestsResponse] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getDonors(),
        adminAPI.getRequests(),
      ])

      setUsers(getApiData(usersResponse, []))
      setDonors(getApiData(donorsResponse, []))
      setRequests(getApiData(requestsResponse, []))
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load admin data'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async () => {
    if (!confirm) {
      return
    }

    try {
      if (confirm.type === 'user') await adminAPI.deleteUser(confirm.id)
      if (confirm.type === 'donor') await adminAPI.deleteDonor(confirm.id)
      if (confirm.type === 'request') await adminAPI.deleteRequest(confirm.id)
      toast.success('Deleted successfully')
      await load()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Delete failed'))
    } finally {
      setConfirm(null)
    }
  }

  const tabs = [
    { key: 'users', label: 'Users', count: users.length, icon: Users },
    { key: 'donors', label: 'Donors', count: donors.length, icon: Droplets },
    { key: 'requests', label: 'Requests', count: requests.length, icon: ClipboardList },
  ]

  const renderEmptyState = (title, description) => (
    <EmptyState icon={Shield} title={title} description={description} />
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}

      <PageHeader
        title="Admin Panel"
        subtitle="Manage all users, donors, and blood requests"
        action={
          <button onClick={load} disabled={loading} className="btn-ghost flex items-center gap-2 text-sm px-4 py-2.5 border border-white/12 rounded-xl">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tabs.map(({ key, label, count, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`glass-card p-4 text-left transition-all hover:border-blood-800/50 ${
              tab === key ? 'border-blood-700/60 bg-blood-950/20' : ''
            }`}
          >
            <Icon size={18} className="text-blood-400 mb-2" />
            <div className="font-display text-2xl font-bold text-white">{count}</div>
            <div className="text-xs text-gray-400 mt-0.5">{label}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-1 p-1 bg-white/5 rounded-xl w-fit">
        {tabs.map(item => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === item.key ? 'bg-blood-700 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="glass-card p-4 flex items-center gap-4 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-white/8" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 rounded bg-white/8" />
                <div className="h-2 w-48 rounded bg-white/5" />
              </div>
              <div className="h-8 w-20 rounded-lg bg-white/5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {tab === 'users' && (
            users.length === 0 ? renderEmptyState('No users found', 'New signups will appear here.') : users.map(user => (
              <div key={user.id} className="glass-card p-4 flex items-center gap-4 hover:border-white/15 transition-all">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blood-700 to-blood-950 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {user.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{user.name || 'Unnamed user'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email || 'No email'}</p>
                </div>
                <Badge variant={ROLE_COLORS[user.role] || 'default'}>{user.role || 'UNKNOWN'}</Badge>
                <p className="text-xs text-gray-600 hidden sm:block">{formatDate(user.createdAt)}</p>
                <button
                  onClick={() => setConfirm({ type: 'user', id: user.id, message: `Delete user "${user.name || 'this user'}"? All related data will be removed.` })}
                  className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-900/20 transition-colors shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}

          {tab === 'donors' && (
            donors.length === 0 ? renderEmptyState('No donors found', 'Donor profiles will appear here.') : donors.map(donor => (
              <div key={donor.id} className="glass-card p-4 flex items-center gap-4 hover:border-white/15 transition-all">
                <BloodGroupPill group={donor.bloodGroup} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{donor.userName || 'Unknown donor'}</p>
                  <p className="text-xs text-gray-500">{[donor.city, donor.district, donor.state].filter(Boolean).join(', ') || donor.location || 'No location'} - {donor.phone || 'No phone'}</p>
                </div>
                <Badge variant={donor.availability ? 'success' : 'default'}>
                  {donor.availability ? 'Available' : 'Unavailable'}
                </Badge>
                <button
                  onClick={() => setConfirm({ type: 'donor', id: donor.id, message: `Delete donor profile for "${donor.userName || 'this donor'}"?` })}
                  className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-900/20 transition-colors shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}

          {tab === 'requests' && (
            requests.length === 0 ? renderEmptyState('No requests found', 'Blood requests will appear here.') : requests.map(request => (
              <div key={request.id} className="glass-card p-4 flex flex-col gap-3 sm:flex-row sm:items-center hover:border-white/15 transition-all">
                <BloodGroupPill group={request.bloodGroup} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{request.location || 'No location provided'}</p>
                  <p className="text-xs text-gray-500">{request.contact || 'No contact'} - by {request.requestedByName || 'Unknown'}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <UrgencyBadge urgency={request.urgency} />
                  <StatusBadge status={request.status} />
                </div>
                <button
                  onClick={() => setConfirm({ type: 'request', id: request.id, message: `Delete this ${request.bloodGroup || ''} blood request?` })}
                  className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-900/20 transition-colors shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
