import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Droplets, MapPin, Phone, AlertTriangle, FileText, ArrowLeft, Siren } from 'lucide-react'
import { requestAPI } from '../services/api'
import { PageHeader } from '../components/ui'
import LocationAutocomplete from '../components/LocationAutocomplete'
import { applySelectedLocation, getErrorMessage, getInitialLocationState } from '../utils/app'
import toast from 'react-hot-toast'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const URGENCY_OPTIONS = [
  { value: 'LOW', label: 'Low', desc: 'Plan within a week', color: 'blue' },
  { value: 'MEDIUM', label: 'Medium', desc: 'Needed in 2-3 days', color: 'amber' },
  { value: 'HIGH', label: 'High', desc: 'Needed within 24 hours', color: 'red' },
  { value: 'CRITICAL', label: 'Critical', desc: 'Immediate emergency', color: 'red' },
]

const urgencyColors = {
  blue: 'border-blue-600 bg-blue-900/30 text-blue-300',
  amber: 'border-amber-600 bg-amber-900/30 text-amber-300',
  red: 'border-red-600 bg-red-900/40 text-red-300',
}

export default function NewRequest() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    bloodGroup: '',
    urgency: 'MEDIUM',
    contact: '',
    notes: '',
    ...getInitialLocationState(),
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const isEmergency = useMemo(
    () => form.urgency === 'HIGH' || form.urgency === 'CRITICAL',
    [form.urgency]
  )

  const validate = () => {
    const nextErrors = {}
    if (!form.bloodGroup) nextErrors.bloodGroup = 'Please select a blood group'
    if (!form.location.trim()) nextErrors.location = 'Location is required'
    if (!form.state.trim()) nextErrors.state = 'State is required'
    if (!form.district.trim()) nextErrors.district = 'District is required'
    if (!form.city.trim()) nextErrors.city = 'City is required'
    if (!form.contact.trim()) nextErrors.contact = 'Contact number is required'
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
      await requestAPI.create({
        bloodGroup: form.bloodGroup,
        location: form.location.trim(),
        state: form.state.trim(),
        district: form.district.trim(),
        city: form.city.trim(),
        latitude: form.latitude,
        longitude: form.longitude,
        urgency: form.urgency,
        contact: form.contact.trim(),
        notes: form.notes.trim(),
      })
      toast.success('Blood request posted successfully!')
      navigate('/requests')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to create request'))
    } finally {
      setLoading(false)
    }
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
        title="Request Blood"
        subtitle="Post a location-aware blood request and instantly promote urgent cases to the top of the network."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <Droplets size={14} className="text-blood-400" /> Blood Group Needed *
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
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-blood-800/50'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
              {errors.bloodGroup && <p className="text-xs text-red-400">{errors.bloodGroup}</p>}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <AlertTriangle size={14} className="text-blood-400" /> Urgency Level *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {URGENCY_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm(current => ({ ...current, urgency: option.value }))}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      form.urgency === option.value
                        ? urgencyColors[option.color]
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <div className="text-sm font-bold">{option.label}</div>
                    <div className="mt-0.5 text-xs opacity-70">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <MapPin size={14} className="text-blood-400" /> Hospital / Location *
              </label>
              <LocationAutocomplete
                placeholder="Search hospital, city, or locality"
                value={form.city || form.location}
                onChange={value => setForm(current => ({ ...current, city: value }))}
                onSelect={item => {
                  setForm(current => applySelectedLocation(current, item))
                  setErrors(current => ({ ...current, location: '', state: '', district: '', city: '' }))
                }}
                inputClassName={errors.location ? 'border-red-500' : ''}
              />
              {errors.location && <p className="text-xs text-red-400">{errors.location}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">State *</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={event => setForm(current => ({ ...current, state: event.target.value }))}
                  className={`input-field ${errors.state ? 'border-red-500' : ''}`}
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
                />
                {errors.city && <p className="text-xs text-red-400">{errors.city}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <Phone size={14} className="text-blood-400" /> Contact Number *
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={form.contact}
                onChange={event => setForm(current => ({ ...current, contact: event.target.value }))}
                className={`input-field ${errors.contact ? 'border-red-500' : ''}`}
              />
              {errors.contact && <p className="text-xs text-red-400">{errors.contact}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <FileText size={14} className="text-blood-400" /> Additional Notes
              </label>
              <textarea
                placeholder="Patient condition, units needed, blood bank desk, or anything coordinators should know."
                value={form.notes}
                onChange={event => setForm(current => ({ ...current, notes: event.target.value }))}
                rows={4}
                className="input-field resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex w-full items-center justify-center gap-2 py-3"
            >
              {loading
                ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Posting request...</>
                : 'Post Blood Request'}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {isEmergency && (
            <div className="glass-card animate-pulse-slow border-red-700/50 bg-red-950/20 p-5">
              <div className="mb-2 flex items-center gap-2 text-red-300">
                <Siren size={18} />
                <span className="font-semibold">Emergency Mode Active</span>
              </div>
              <p className="text-sm text-red-200/80">
                This request will be highlighted, sorted to the top, and shown with ranked donor matches.
              </p>
            </div>
          )}

          <div className="glass-card p-5">
            <h3 className="mb-3 font-semibold text-white">Request Summary</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p><span className="text-white">Blood group:</span> {form.bloodGroup || '--'}</p>
              <p><span className="text-white">Urgency:</span> {form.urgency}</p>
              <p><span className="text-white">Location:</span> {form.location || '--'}</p>
              <p><span className="text-white">State / District / City:</span> {[form.state, form.district, form.city].filter(Boolean).join(' / ') || '--'}</p>
              <p><span className="text-white">Coordinates:</span> {form.latitude ?? '--'}, {form.longitude ?? '--'}</p>
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="mb-3 font-semibold text-white">What Happens Next</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>1. The backend computes a priority score from urgency and request age.</p>
              <p>2. Matching donors are ranked using blood group, city, district, nearness, and recent activity.</p>
              <p>3. High-priority requests are pushed to the top of dashboards and request boards.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
