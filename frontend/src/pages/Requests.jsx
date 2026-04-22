import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Droplets, Plus, MapPin, Phone, Clock, SlidersHorizontal, X, AlertTriangle, Siren, PhoneCall, MessageCircle } from 'lucide-react'
import { requestAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  SkeletonCard,
  EmptyState,
  PageHeader,
  UrgencyBadge,
  StatusBadge,
  BloodGroupPill,
  HighlightedText,
  Badge,
} from '../components/ui'
import LocationAutocomplete from '../components/LocationAutocomplete'
import { formatDateTime, formatNumber, getApiData, getErrorMessage, getPhoneHref, getWhatsAppHref, normalizeText, sanitizeDisplayName } from '../utils/app'
import toast from 'react-hot-toast'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const STATUSES = ['PENDING', 'FULFILLED', 'COMPLETED', 'CANCELLED']

function RequestCard({ req, canManage, onStatusChange, locationQuery }) {
  const [updating, setUpdating] = useState(false)
  const isEmergency = req?.urgency === 'HIGH' || req?.urgency === 'CRITICAL'

  const handleStatusChange = async (status) => {
    setUpdating(true)
    try {
      await requestAPI.updateStatus(req.id, status)
      toast.success('Status updated')
      onStatusChange?.()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update status'))
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className={`glass-card p-5 transition-all hover:border-blood-800/50 ${isEmergency ? 'border-red-800/60 bg-red-950/10' : 'animate-slide-up'}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <BloodGroupPill group={req?.bloodGroup} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <UrgencyBadge urgency={req?.urgency} />
              <StatusBadge status={req?.status} />
              <Badge variant={isEmergency ? 'danger' : 'info'}>Priority {req?.priorityScore ?? 0}</Badge>
            </div>
            <p className="mt-1 text-xs text-gray-500">by {req?.requestedByName || 'Anonymous'}</p>
          </div>
        </div>
        {isEmergency && <Siren size={18} className="animate-pulse text-red-400" />}
      </div>

      <div className="mb-4 space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <MapPin size={12} className="shrink-0 text-gray-600" />
          <HighlightedText text={req?.location || 'Location pending'} query={locationQuery} />
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Phone size={12} className="shrink-0 text-gray-600" /> {req?.contact || 'No contact provided'}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock size={12} className="shrink-0 text-gray-700" /> {formatDateTime(req?.createdAt)}
        </div>
      </div>

      {req?.notes && (
        <p className="mb-3 rounded-lg border border-white/6 bg-white/4 px-3 py-2 text-xs italic text-gray-500">
          "{req.notes}"
        </p>
      )}

      <div className="rounded-xl border border-white/8 bg-white/4 p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Top Matches</p>
          <span className="text-xs text-blood-300">{req?.matchedDonorCount ?? 0} donors</span>
        </div>
        <div className="space-y-2">
          {(req?.matchedDonors || []).slice(0, 3).map(donor => (
            <div key={donor?.id} className="flex items-center justify-between gap-2 rounded-lg border border-white/6 px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{sanitizeDisplayName(donor?.userName)}</p>
                <p className="truncate text-xs text-gray-500">
                  {donor?.city || donor?.district || donor?.location || 'Location pending'} • score {donor?.matchScore ?? 0}
                  {donor?.distanceKm !== null && donor?.distanceKm !== undefined ? ` • ${formatNumber(donor.distanceKm)} km` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getPhoneHref(donor?.phone) && (
                  <a href={getPhoneHref(donor?.phone)} className="rounded-lg bg-blood-700/20 p-2 text-blood-300 hover:bg-blood-700/30">
                    <PhoneCall size={14} />
                  </a>
                )}
                {getWhatsAppHref(donor?.phone, donor?.whatsappLink) && (
                  <a href={getWhatsAppHref(donor?.phone, donor?.whatsappLink)} target="_blank" rel="noreferrer" className="rounded-lg bg-emerald-900/20 p-2 text-emerald-300 hover:bg-emerald-900/30">
                    <MessageCircle size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
          {(req?.matchedDonors || []).length === 0 && (
            <p className="text-xs text-gray-500">No ranked donor matches available yet.</p>
          )}
        </div>
      </div>

      {canManage && req?.status === 'PENDING' && (
        <div className="mt-3 flex gap-2 border-t border-white/6 pt-3">
          <button
            onClick={() => handleStatusChange('FULFILLED')}
            disabled={updating}
            className="flex-1 rounded-lg border border-blue-800/40 bg-blue-900/30 py-1.5 text-xs font-semibold text-blue-300 transition-colors hover:bg-blue-900/50 disabled:opacity-50"
          >
            Mark Fulfilled
          </button>
          <button
            onClick={() => handleStatusChange('COMPLETED')}
            disabled={updating}
            className="flex-1 rounded-lg border border-emerald-800/40 bg-emerald-900/30 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-900/50 disabled:opacity-50"
          >
            Completed
          </button>
        </div>
      )}
    </div>
  )
}

export default function Requests() {
  const { isAdmin, user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ bloodGroup: '', location: '', status: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [tab, setTab] = useState('all')
  const deferredFilters = useDeferredValue(filters)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      let response
      if (tab === 'emergency') {
        response = await requestAPI.getEmergency()
      } else if (tab === 'mine') {
        response = await requestAPI.getMyRequests()
      } else {
        const params = {}
        if (deferredFilters.bloodGroup) params.bloodGroup = deferredFilters.bloodGroup
        if (deferredFilters.location) params.location = deferredFilters.location
        if (deferredFilters.status) params.status = deferredFilters.status
        response = await requestAPI.getAll(params)
      }

      setRequests(getApiData(response, []))
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load requests'))
    } finally {
      setLoading(false)
    }
  }, [deferredFilters, tab])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const clearFilters = () => setFilters({ bloodGroup: '', location: '', status: '' })
  const hasFilters = filters.bloodGroup || filters.location || filters.status
  const highlightedLocation = normalizeText(filters.location)
  const emergencyCount = useMemo(
    () => requests.filter(request => request?.urgency === 'HIGH' || request?.urgency === 'CRITICAL').length,
    [requests]
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Blood Requests"
        subtitle={`${requests.length} request${requests.length !== 1 ? 's' : ''} • ${emergencyCount} urgent`}
        action={
          <div className="flex items-center gap-2">
            {tab === 'all' && (
              <button
                onClick={() => setShowFilters(value => !value)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                  showFilters || hasFilters
                    ? 'border-blood-600 bg-blood-900/30 text-blood-300'
                    : 'border-white/12 bg-white/5 text-gray-300 hover:border-white/20'
                }`}
              >
                <SlidersHorizontal size={15} />
                Filters {hasFilters && <span className="h-2 w-2 rounded-full bg-blood-500" />}
              </button>
            )}
            <Link to="/requests/new" className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm">
              <Plus size={15} /> New Request
            </Link>
          </div>
        }
      />

      {emergencyCount > 0 && (
        <div className="glass-card flex items-center gap-3 border-red-800/50 bg-red-950/20 p-4">
          <AlertTriangle size={18} className="text-red-400" />
          <div>
            <p className="font-semibold text-red-200">Emergency requests active</p>
            <p className="text-sm text-red-200/80">High-priority requests are highlighted, sorted first, and paired with ranked donors.</p>
          </div>
        </div>
      )}

      <div className="flex w-fit gap-1 rounded-xl bg-white/5 p-1">
        {[
          { key: 'all', label: 'All Requests' },
          { key: 'emergency', label: 'Emergency' },
          { key: 'mine', label: 'My Requests' },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => {
              setTab(item.key)
              setShowFilters(false)
            }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              tab === item.key ? 'bg-blood-700 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {showFilters && tab === 'all' && (
        <div className="glass-card animate-slide-up p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Filter Requests</p>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white">
                <X size={12} /> Clear
              </button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs text-gray-400">Blood Group</label>
              <div className="flex flex-wrap gap-1.5">
                {BLOOD_GROUPS.map(group => (
                  <button
                    key={group}
                    onClick={() => setFilters(current => ({ ...current, bloodGroup: current.bloodGroup === group ? '' : group }))}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition-all ${
                      filters.bloodGroup === group
                        ? 'border-blood-600 bg-blood-700 text-white'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-gray-400">Status</label>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map(status => (
                  <button
                    key={status}
                    onClick={() => setFilters(current => ({ ...current, status: current.status === status ? '' : status }))}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all ${
                      filters.status === status
                        ? 'border-blood-600 bg-blood-700 text-white'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs text-gray-400">Location</label>
              <LocationAutocomplete
                placeholder="Filter by city..."
                value={filters.location}
                onChange={location => setFilters(current => ({ ...current, location }))}
                inputClassName="py-2 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => <SkeletonCard key={index} />)}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={Droplets}
          title="No requests found"
          description={tab === 'mine' ? "You haven't created any requests yet." : 'No blood requests match your criteria.'}
          action={
            <Link to="/requests/new" className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
              <Plus size={14} /> Create Request
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map(request => (
            <RequestCard
              key={request?.id}
              req={request}
              canManage={isAdmin || request?.requestedById === user?.id}
              onStatusChange={fetchRequests}
              locationQuery={highlightedLocation}
            />
          ))}
        </div>
      )}
    </div>
  )
}
