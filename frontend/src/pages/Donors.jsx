import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  MapPin,
  Phone,
  MessageCircle,
  SlidersHorizontal,
  X,
  Users,
  ShieldCheck,
  PhoneCall,
  Siren,
  LocateFixed,
  Activity,
} from 'lucide-react'
import { donorAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  EmptyState,
  PageHeader,
  BloodGroupPill,
  HighlightedText,
  Badge,
  Button,
} from '../components/ui'
import LocationAutocomplete from '../components/LocationAutocomplete'
import {
  formatDate,
  formatNumber,
  getApiData,
  getEligibilitySummary,
  getErrorMessage,
  getPhoneHref,
  getWhatsAppHref,
  normalizeText,
  sanitizeDisplayName,
} from '../utils/app'
import toast from 'react-hot-toast'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

function FilterSelect({ label, value, options, onChange, placeholder = 'All' }) {
  return (
    <label className="space-y-1.5">
      <span className="block text-xs text-gray-400">{label}</span>
      <select value={value} onChange={event => onChange(event.target.value)} className="select-field py-2.5">
        <option value="">{placeholder}</option>
        {options.map(option => {
          const normalized = typeof option === 'string' ? { value: option, label: option } : option
          return <option key={normalized.value} value={normalized.value}>{normalized.label}</option>
        })}
      </select>
    </label>
  )
}

function DonorCard({ donor, currentUserId, query, onToggleAvailability, showMatchScore }) {
  const isOwn = donor?.userId === currentUserId
  const quickLocation = [donor?.city, donor?.district, donor?.state].filter(Boolean).join(', ') || donor?.location || 'Location pending'
  const showEligibilityBadge = Boolean(donor?.eligibilityStatus) && donor?.eligibilityStatus !== 'Eligibility pending'
  const showScore = showMatchScore && typeof donor?.matchScore === 'number'
  const displayName = isOwn
    ? sanitizeDisplayName(donor?.userName, 'Your donor profile')
    : sanitizeDisplayName(donor?.userName)
  const callHref = getPhoneHref(donor?.phone)
  const whatsappHref = getWhatsAppHref(donor?.phone, donor?.whatsappLink)

  return (
    <div className={`glass-card p-5 transition-all hover:border-blood-800/50 ${
      donor?.emergencyDonor ? 'border-red-800/40 bg-red-950/10' : ''
    }`}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <BloodGroupPill group={donor?.bloodGroup} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-white">{displayName}</h3>
              {donor?.emergencyDonor && (
                <Badge variant="danger" className="gap-1">
                  <Siren size={12} /> Emergency Donor
                </Badge>
              )}
              <Badge variant={donor?.availability ? 'success' : 'default'}>
                {donor?.availability ? 'Available' : 'Unavailable'}
              </Badge>
              {showEligibilityBadge && (
                <Badge variant={donor.eligibleToDonate ? 'success' : 'danger'}>
                  {donor?.eligibilityStatus || 'Eligibility pending'}
                </Badge>
              )}
            </div>

            <div className="mt-3 grid gap-1.5 text-sm text-gray-400 md:grid-cols-2">
              <p className="flex items-center gap-2">
                <MapPin size={14} className="shrink-0 text-blood-400" />
                <HighlightedText text={quickLocation} query={query} />
              </p>
              <p className="flex items-center gap-2">
                <Phone size={14} className="shrink-0 text-blood-400" />
                {donor?.phone || 'No phone number'}
              </p>
              {showScore && (
                <p className="flex items-center gap-2">
                  <Activity size={14} className="shrink-0 text-blood-400" />
                  Match score: {donor.matchScore}
                </p>
              )}
              <p className="flex items-center gap-2">
                <ShieldCheck size={14} className="shrink-0 text-blood-400" />
                {getEligibilitySummary(donor)}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
              <span className="rounded-full border border-white/10 px-3 py-1">
                Last donation: {donor?.lastDonationDate ? formatDate(donor.lastDonationDate) : 'Not recorded'}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1">
                Age: {donor?.age ?? '--'}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1">
                Weight: {donor?.weight ? `${formatNumber(donor.weight)} kg` : '--'}
              </span>
              {donor?.distanceKm !== null && donor?.distanceKm !== undefined && (
                <span className="rounded-full border border-white/10 px-3 py-1">
                  Near you: {formatNumber(donor.distanceKm)} km
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 xl:justify-end">
          {!isOwn && callHref && (
            <a href={callHref} className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm">
              <PhoneCall size={14} /> Call
            </a>
          )}
          {!isOwn && whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-800/40 bg-emerald-900/20 px-4 py-2.5 text-sm text-emerald-300 transition-colors hover:bg-emerald-900/30"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
          )}
          {!isOwn && donor?.userId && (
            <Link
              to={`/messages/${donor.userId}`}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-800/40 bg-blue-900/20 px-4 py-2.5 text-sm text-blue-300 transition-colors hover:bg-blue-900/30"
            >
              <MessageCircle size={14} /> Message
            </Link>
          )}
          {isOwn && (
            <>
              <button
                onClick={() => onToggleAvailability?.(donor)}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-800/40 px-4 py-2.5 text-sm text-emerald-300 transition-colors hover:bg-emerald-900/20"
              >
                <ShieldCheck size={14} /> {donor?.availability ? 'Pause listing' : 'Activate listing'}
              </button>
              <Link to={`/donors/${donor?.id}/edit`} className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm">
                Edit Profile
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Donors() {
  const { user, isDonor } = useAuth()
  const [donors, setDonors] = useState([])
  const [filterOptions, setFilterOptions] = useState({ states: [], districts: [], cities: [] })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    bloodGroup: '',
    state: '',
    district: '',
    city: '',
    availability: '',
    eligibility: '',
    sortBy: 'matchScore',
  })
  const [showFilters, setShowFilters] = useState(true)
  const [myDonorId, setMyDonorId] = useState(null)
  const [nearbyOnly, setNearbyOnly] = useState(false)
  const [geo, setGeo] = useState({ latitude: null, longitude: null })
  const deferredFilters = useDeferredValue(filters)

  useEffect(() => {
    donorAPI.getFilterOptions({ state: filters.state, district: filters.district || undefined })
      .then(response => setFilterOptions(getApiData(response, { states: [], districts: [], cities: [] })))
      .catch(() => {})
  }, [filters.state, filters.district])

  const loadDonors = useCallback(async (activeFilters = deferredFilters) => {
    setLoading(true)
    try {
      const params = {}
      if (activeFilters.bloodGroup) params.bloodGroup = activeFilters.bloodGroup
      if (activeFilters.state) params.state = activeFilters.state
      if (activeFilters.district) params.district = activeFilters.district
      if (activeFilters.city) params.city = activeFilters.city
      if (activeFilters.availability !== '') params.availability = activeFilters.availability === 'true'

      const response = Object.keys(params).length > 0 ? await donorAPI.search(params) : await donorAPI.getAll()
      setDonors(getApiData(response, []))
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load donors'))
    } finally {
      setLoading(false)
    }
  }, [deferredFilters])

  useEffect(() => {
    loadDonors(deferredFilters)
  }, [deferredFilters, loadDonors])

  useEffect(() => {
    if (!isDonor) {
      return
    }

    donorAPI.getMe()
      .then(response => setMyDonorId(getApiData(response)?.id || null))
      .catch(error => {
        if (error?.response?.status !== 404) {
          toast.error(getErrorMessage(error, 'Failed to load your donor profile'))
        }
        setMyDonorId(null)
      })
  }, [isDonor])

  const filteredDonors = useMemo(() => donors
    .filter(donor => {
      if (filters.eligibility === 'eligible' && !donor?.eligibleToDonate) {
        return false
      }
      if (filters.eligibility === 'ineligible' && donor?.eligibleToDonate) {
        return false
      }
      if (nearbyOnly && ((donor?.distanceKm ?? Number.POSITIVE_INFINITY) > 25)) {
        return false
      }
      return true
    })
    .sort((left, right) => {
      if (filters.sortBy === 'nearest') {
        return (left?.distanceKm ?? Number.POSITIVE_INFINITY) - (right?.distanceKm ?? Number.POSITIVE_INFINITY)
      }
      if (filters.sortBy === 'recent') {
        return new Date(right?.lastActiveAt || 0).getTime() - new Date(left?.lastActiveAt || 0).getTime()
      }
      return (right?.matchScore ?? 0) - (left?.matchScore ?? 0)
    }), [donors, filters.eligibility, filters.sortBy, nearbyOnly])

  const clearFilters = () => setFilters({
    bloodGroup: '',
    state: '',
    district: '',
    city: '',
    availability: '',
    eligibility: '',
    sortBy: 'matchScore',
  })

  const hasFilters = Boolean(
    filters.bloodGroup || filters.state || filters.district || filters.city || filters.availability !== '' || filters.eligibility || filters.sortBy !== 'matchScore'
  )
  const availableCount = useMemo(() => filteredDonors.filter(donor => donor?.availability).length, [filteredDonors])
  const emergencyCount = useMemo(() => filteredDonors.filter(donor => donor?.emergencyDonor).length, [filteredDonors])
  const cityQuery = normalizeText(filters.city)

  const handleToggleAvailability = async (donor) => {
    try {
      const response = await donorAPI.toggleAvailability(donor.id)
      const updated = getApiData(response)
      setDonors(current => current.map(item => item.id === donor.id ? updated : item))
      toast.success(`You are now ${updated?.availability ? 'available' : 'unavailable'} to donate`)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update availability'))
    }
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not available in this browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setGeo({ latitude: coords.latitude, longitude: coords.longitude })
        setNearbyOnly(true)
        try {
          const response = await donorAPI.getAll()
          const nextDonors = getApiData(response, [])
            .map(donor => {
              if (donor?.latitude === null || donor?.latitude === undefined || donor?.longitude === null || donor?.longitude === undefined) {
                return donor
              }
              const toRad = (value) => (value * Math.PI) / 180
              const earthRadiusKm = 6371
              const dLat = toRad(donor.latitude - coords.latitude)
              const dLon = toRad(donor.longitude - coords.longitude)
              const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(toRad(coords.latitude)) * Math.cos(toRad(donor.latitude))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2)
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
              const distanceKm = Math.round((earthRadiusKm * c) * 10) / 10
              return { ...donor, distanceKm }
            })
            .sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999))
          setDonors(nextDonors)
          toast.success('Nearby donors ranked by distance')
        } catch (error) {
          toast.error(getErrorMessage(error, 'Failed to filter nearby donors'))
        }
      },
      () => toast.error('Unable to access your location')
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Donor Search"
        subtitle={`${filteredDonors.length} donors found • ${availableCount} active • ${emergencyCount} emergency-ready`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowFilters(value => !value)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                showFilters || hasFilters
                  ? 'border-blood-600 bg-blood-900/30 text-blood-300'
                  : 'border-white/12 bg-white/5 text-gray-300 hover:border-white/20 hover:text-white'
              }`}
            >
              <SlidersHorizontal size={15} />
              Filters
            </button>
            <Button type="button" variant={nearbyOnly ? 'outline' : 'primary'} onClick={handleUseMyLocation} className="px-4 py-2.5 text-sm">
              <LocateFixed size={15} /> Near Me
            </Button>
            {isDonor && !myDonorId && (
              <Link to="/donors/new" className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm">
                <Plus size={15} /> New Donor Registration
              </Link>
            )}
          </div>
        }
      />

      {nearbyOnly && (
        <div className="glass-card flex flex-wrap items-center justify-between gap-3 border-blood-800/40 p-4">
          <div>
            <p className="font-semibold text-white">Near Me mode enabled</p>
            <p className="text-sm text-gray-400">
              Ranking nearby donors around {geo.latitude ? `${formatNumber(geo.latitude)}, ${formatNumber(geo.longitude)}` : 'your current location'}.
            </p>
          </div>
          <button onClick={() => setNearbyOnly(false)} className="text-sm text-gray-400 hover:text-white">Show all donors</button>
        </div>
      )}

      {showFilters && (
        <div className="glass-card space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Friends2Support-style Smart Search</p>
              <p className="mt-1 text-xs text-gray-500">Combine blood group, state, district, city, availability, and eligibility filters in real time.</p>
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white">
                <X size={12} /> Clear all
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <FilterSelect label="Blood Group" value={filters.bloodGroup} options={BLOOD_GROUPS} onChange={bloodGroup => setFilters(current => ({ ...current, bloodGroup }))} />
            <FilterSelect label="State" value={filters.state} options={filterOptions.states || []} onChange={state => setFilters(current => ({ ...current, state, district: '', city: '' }))} />
            <FilterSelect label="District" value={filters.district} options={filterOptions.districts || []} onChange={district => setFilters(current => ({ ...current, district, city: '' }))} />
            <label className="space-y-1.5">
              <span className="block text-xs text-gray-400">City</span>
              <LocationAutocomplete
                value={filters.city}
                onChange={city => setFilters(current => ({ ...current, city }))}
                onSelect={item => setFilters(current => ({
                  ...current,
                  city: item?.city || item?.label || current.city,
                  district: item?.district || current.district,
                  state: item?.state || current.state,
                }))}
                placeholder="Search city"
                inputClassName="py-2.5"
              />
            </label>
            <FilterSelect
              label="Availability"
              value={filters.availability}
              options={[
                { value: 'true', label: 'Available' },
                { value: 'false', label: 'Unavailable' },
              ]}
              onChange={availability => setFilters(current => ({ ...current, availability }))}
            />
            <FilterSelect
              label="Eligibility"
              value={filters.eligibility}
              options={[
                { value: 'eligible', label: 'Eligible' },
                { value: 'ineligible', label: 'Not Eligible' },
              ]}
              onChange={eligibility => setFilters(current => ({ ...current, eligibility }))}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <FilterSelect
              label="Sort By"
              value={filters.sortBy}
              options={[
                { value: 'matchScore', label: 'Match score' },
                { value: 'nearest', label: 'Nearest location' },
                { value: 'recent', label: 'Recently active' },
              ]}
              onChange={sortBy => setFilters(current => ({ ...current, sortBy }))}
              placeholder="Sort"
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="glass-card animate-pulse space-y-3 p-5">
              <div className="h-4 w-40 rounded bg-white/10" />
              <div className="h-3 w-60 rounded bg-white/5" />
              <div className="h-3 w-32 rounded bg-white/5" />
            </div>
          ))}
        </div>
      ) : filteredDonors.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No donors found"
          description="Try changing your blood group or location filters to expand the search."
          action={hasFilters && (
            <button onClick={clearFilters} className="btn-primary px-4 py-2 text-sm">
              Reset search
            </button>
          )}
        />
      ) : (
        <div className="space-y-4">
          {filteredDonors.map(donor => (
            <DonorCard
              key={donor?.id}
              donor={donor}
              currentUserId={user?.id}
              query={cityQuery}
              onToggleAvailability={handleToggleAvailability}
              showMatchScore={hasFilters || nearbyOnly}
            />
          ))}
        </div>
      )}
    </div>
  )
}
