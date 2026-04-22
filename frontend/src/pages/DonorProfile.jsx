import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Heart,
  MapPin,
  Phone,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  User,
  MapPinned,
  Activity,
  Weight,
  ShieldCheck,
} from 'lucide-react'
import { donorAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { PageHeader } from '../components/ui'
import LocationAutocomplete from '../components/LocationAutocomplete'
import { applySelectedLocation, getApiData, getErrorMessage, getInitialLocationState } from '../utils/app'
import toast from 'react-hot-toast'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function DonorProfile() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user, updateUser, refreshUser } = useAuth()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    name: '',
    bloodGroup: '',
    phone: '',
    availability: true,
    lastDonationDate: '',
    age: '',
    weight: '',
    healthy: true,
    ...getInitialLocationState(),
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)

  useEffect(() => {
    if (!isEdit && user?.name) {
      setForm(current => ({ ...current, name: current.name || user.name }))
    }
  }, [isEdit, user])

  useEffect(() => {
    if (!isEdit) {
      return
    }

    donorAPI.getById(id)
      .then(response => {
        const donor = getApiData(response, {})
        setForm({
          name: donor?.userName || '',
          bloodGroup: donor?.bloodGroup || '',
          location: donor?.location || '',
          state: donor?.state || '',
          district: donor?.district || '',
          city: donor?.city || '',
          latitude: donor?.latitude ?? null,
          longitude: donor?.longitude ?? null,
          phone: donor?.phone || '',
          availability: donor?.availability ?? true,
          lastDonationDate: donor?.lastDonationDate || '',
          age: donor?.age ?? '',
          weight: donor?.weight ?? '',
          healthy: donor?.healthy ?? true,
        })
      })
      .catch(error => toast.error(getErrorMessage(error, 'Failed to load donor data')))
      .finally(() => setFetching(false))
  }, [id, isEdit])

  const eligibilityPreview = useMemo(() => {
    const ageOk = Number(form.age || 0) >= 18
    const weightOk = Number(form.weight || 0) >= 50
    const healthyOk = Boolean(form.healthy)
    return {
      ageOk,
      weightOk,
      healthyOk,
      eligible: ageOk && weightOk && healthyOk,
    }
  }, [form.age, form.weight, form.healthy])

  const validate = () => {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Name is required'
    if (!form.bloodGroup) nextErrors.bloodGroup = 'Blood group is required'
    if (!form.state.trim()) nextErrors.state = 'State is required'
    if (!form.district.trim()) nextErrors.district = 'District is required'
    if (!form.city.trim()) nextErrors.city = 'City is required'
    if (!form.location.trim()) nextErrors.location = 'Location is required'
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required'
    if (!form.age || Number(form.age) < 18) nextErrors.age = 'Age must be 18 or above'
    if (!form.weight || Number(form.weight) < 50) nextErrors.weight = 'Weight must be at least 50 kg'
    if (!form.healthy) nextErrors.healthy = 'Only healthy donors can be listed as eligible'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) {
      return
    }

    setLoading(true)
    try {
      const payload = {
        name: form.name.trim(),
        bloodGroup: form.bloodGroup,
        location: form.location.trim(),
        state: form.state.trim(),
        district: form.district.trim(),
        city: form.city.trim(),
        phone: form.phone.trim(),
        availability: form.availability,
        lastDonationDate: form.lastDonationDate || null,
        age: Number(form.age),
        weight: Number(form.weight),
        healthy: Boolean(form.healthy),
        latitude: form.latitude,
        longitude: form.longitude,
      }

      if (isEdit) {
        const response = await donorAPI.update(id, payload)
        const updatedDonor = getApiData(response, null)
        if (updatedDonor?.userName || updatedDonor?.userEmail) {
          updateUser({
            name: updatedDonor?.userName || user?.name,
            email: updatedDonor?.userEmail || user?.email,
          })
        } else {
          await refreshUser()
        }
        toast.success('Donor profile updated!')
      } else {
        const response = await donorAPI.create(payload)
        const createdDonor = getApiData(response, null)
        if (createdDonor?.userName || createdDonor?.userEmail) {
          updateUser({
            name: createdDonor?.userName || user?.name,
            email: createdDonor?.userEmail || user?.email,
          })
        } else {
          await refreshUser()
        }
        toast.success('Donor profile created!')
      }

      navigate('/donors')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Something went wrong'))
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded bg-white/8" />
        <div className="glass-card space-y-4 p-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="space-y-1.5">
              <div className="h-3 w-20 rounded bg-white/8" />
              <div className="h-11 rounded-xl bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <PageHeader
        title={isEdit ? 'Edit Donor Profile' : 'Register as Donor'}
        subtitle="Create a production-ready donor profile with eligibility rules, structured location, and emergency-ready contact details."
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="glass-card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <User size={14} className="text-blood-400" /> Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
                  className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Full donor name"
                />
                {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Phone size={14} className="text-blood-400" /> Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={event => setForm(current => ({ ...current, phone: event.target.value }))}
                  className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                />
                {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <Heart size={14} className="text-blood-400" /> Blood Group *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_GROUPS.map(group => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setForm(current => ({ ...current, bloodGroup: group }))}
                    className={`rounded-xl border py-2.5 text-sm font-bold transition-all ${
                      form.bloodGroup === group
                        ? 'border-blood-600 bg-blood-700 text-white shadow-lg shadow-blood-900/30'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-blood-800/50 hover:text-gray-200'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
              {errors.bloodGroup && <p className="text-xs text-red-400">{errors.bloodGroup}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <MapPinned size={14} className="text-blood-400" /> Search Location
              </label>
              <LocationAutocomplete
                placeholder="Search city, town, or locality"
                value={form.city}
                onChange={city => setForm(current => ({ ...current, city }))}
                onSelect={item => {
                  setForm(current => applySelectedLocation(current, item))
                }}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">State *</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={event => setForm(current => ({ ...current, state: event.target.value }))}
                  className={`input-field ${errors.state ? 'border-red-500' : ''}`}
                  placeholder="State"
                />
                {errors.state && <p className="text-xs text-red-400">{errors.state}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">District *</label>
                <input
                  type="text"
                  value={form.district}
                  onChange={event => setForm(current => ({ ...current, district: event.target.value }))}
                  className={`input-field ${errors.district ? 'border-red-500' : ''}`}
                  placeholder="District"
                />
                {errors.district && <p className="text-xs text-red-400">{errors.district}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">City *</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={event => setForm(current => ({ ...current, city: event.target.value }))}
                  className={`input-field ${errors.city ? 'border-red-500' : ''}`}
                  placeholder="City"
                />
                {errors.city && <p className="text-xs text-red-400">{errors.city}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <MapPin size={14} className="text-blood-400" /> Full Location *
              </label>
              <input
                type="text"
                value={form.location}
                onChange={event => setForm(current => ({ ...current, location: event.target.value }))}
                className={`input-field ${errors.location ? 'border-red-500' : ''}`}
                placeholder="Hospital, area, or donor location"
              />
              {errors.location && <p className="text-xs text-red-400">{errors.location}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Activity size={14} className="text-blood-400" /> Age *
                </label>
                <input
                  type="number"
                  min="18"
                  value={form.age}
                  onChange={event => setForm(current => ({ ...current, age: event.target.value }))}
                  className={`input-field ${errors.age ? 'border-red-500' : ''}`}
                  placeholder="Age in years"
                />
                {errors.age && <p className="text-xs text-red-400">{errors.age}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Weight size={14} className="text-blood-400" /> Weight (kg) *
                </label>
                <input
                  type="number"
                  min="50"
                  step="0.1"
                  value={form.weight}
                  onChange={event => setForm(current => ({ ...current, weight: event.target.value }))}
                  className={`input-field ${errors.weight ? 'border-red-500' : ''}`}
                  placeholder="Weight in kilograms"
                />
                {errors.weight && <p className="text-xs text-red-400">{errors.weight}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Calendar size={14} className="text-blood-400" /> Last Donation Date
                </label>
                <input
                  type="date"
                  value={form.lastDonationDate}
                  onChange={event => setForm(current => ({ ...current, lastDonationDate: event.target.value }))}
                  max={new Date().toISOString().split('T')[0]}
                  className="input-field"
                />
              </div>

              <div className="rounded-xl border border-white/8 bg-white/4 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Healthy to donate *</p>
                    <p className="mt-0.5 text-xs text-gray-500">This feeds the eligibility engine and live matching.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm(current => ({ ...current, healthy: !current.healthy }))}
                    className={`relative h-6 w-12 rounded-full transition-colors duration-200 ${
                      form.healthy ? 'bg-blood-600' : 'bg-white/15'
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                        form.healthy ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                {errors.healthy && <p className="mt-2 text-xs text-red-400">{errors.healthy}</p>}
              </div>
            </div>

            <div className="rounded-xl border border-white/8 bg-white/4 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Available to Donate</p>
                  <p className="mt-0.5 text-xs text-gray-500">Show this donor in active search results and emergency matching.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(current => ({ ...current, availability: !current.availability }))}
                  className={`relative h-6 w-12 rounded-full transition-colors duration-200 ${
                    form.availability ? 'bg-blood-600' : 'bg-white/15'
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                      form.availability ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex w-full items-center justify-center gap-2 py-3"
            >
              {loading
                ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> {isEdit ? 'Updating...' : 'Creating profile...'}</>
                : isEdit ? 'Save Changes' : 'Register as Donor'}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className={`glass-card p-5 ${eligibilityPreview.eligible ? 'border-emerald-800/40' : 'border-red-800/40'}`}>
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-blood-400" />
              <h3 className="font-semibold text-white">Eligibility Check</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Age ≥ 18</span>
                <span className={eligibilityPreview.ageOk ? 'text-emerald-400' : 'text-red-400'}>
                  {eligibilityPreview.ageOk ? 'Pass' : 'Fail'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Weight ≥ 50 kg</span>
                <span className={eligibilityPreview.weightOk ? 'text-emerald-400' : 'text-red-400'}>
                  {eligibilityPreview.weightOk ? 'Pass' : 'Fail'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Healthy</span>
                <span className={eligibilityPreview.healthyOk ? 'text-emerald-400' : 'text-red-400'}>
                  {eligibilityPreview.healthyOk ? 'Pass' : 'Fail'}
                </span>
              </div>
            </div>
            <div className={`mt-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
              eligibilityPreview.eligible
                ? 'border-emerald-800/30 bg-emerald-900/20 text-emerald-400'
                : 'border-red-800/30 bg-red-900/20 text-red-300'
            }`}>
              {eligibilityPreview.eligible
                ? <><CheckCircle2 size={15} /> Eligible to donate</>
                : <><XCircle size={15} /> Not eligible yet</>}
            </div>
          </div>

          <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
            form.availability
              ? 'border-emerald-800/30 bg-emerald-900/20 text-emerald-400'
              : 'border-gray-700/30 bg-gray-800/40 text-gray-500'
          }`}>
            {form.availability
              ? <><CheckCircle2 size={15} /> You will appear in active donor searches</>
              : <><XCircle size={15} /> You will stay hidden until you activate availability again</>}
          </div>

          <div className="glass-card p-5">
            <h3 className="mb-3 font-semibold text-white">Structured Location Preview</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p><span className="text-white">State:</span> {form.state || '--'}</p>
              <p><span className="text-white">District:</span> {form.district || '--'}</p>
              <p><span className="text-white">City:</span> {form.city || '--'}</p>
              <p><span className="text-white">Coordinates:</span> {form.latitude ?? '--'}, {form.longitude ?? '--'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
