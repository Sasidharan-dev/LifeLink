export function getApiData(response, fallback = null) {
  if (response?.data?.data !== undefined) {
    return response.data.data
  }
  if (response?.data !== undefined) {
    return response.data
  }
  return fallback
}

export function getErrorMessage(error, fallback = 'Something went wrong') {
  const payload = error?.response?.data

  if (typeof payload?.message === 'string' && payload.message.trim()) {
    return payload.message
  }

  if (payload?.data && typeof payload.data === 'object') {
    const firstFieldError = Object.values(payload.data).find(Boolean)
    if (typeof firstFieldError === 'string' && firstFieldError.trim()) {
      return firstFieldError
    }
  }

  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message
  }

  return fallback
}

export function sanitizeDisplayName(name, fallback = 'LifeLink Donor') {
  const trimmed = typeof name === 'string' ? name.trim() : ''
  if (!trimmed || /^codex user \d+$/i.test(trimmed)) {
    return fallback
  }
  return trimmed
}

export function getPhoneHref(phone) {
  const digits = typeof phone === 'string' ? phone.replace(/[^\d+]/g, '') : ''
  return digits ? `tel:${digits}` : null
}

export function getWhatsAppHref(phone, whatsappLink) {
  if (typeof whatsappLink === 'string' && whatsappLink.trim()) {
    return whatsappLink
  }

  const digits = typeof phone === 'string' ? phone.replace(/\D/g, '') : ''
  if (!digits) {
    return null
  }

  const normalized = digits.length === 10 ? `91${digits}` : digits
  return `https://wa.me/${normalized}`
}

export function formatDateTime(value, options = { dateStyle: 'medium', timeStyle: 'short' }) {
  if (!value) {
    return 'N/A'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'N/A'
  }

  return date.toLocaleString('en-IN', options)
}

export function formatDate(value, options = { dateStyle: 'medium' }) {
  if (!value) {
    return 'N/A'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'N/A'
  }

  return date.toLocaleDateString('en-IN', options)
}

export function normalizeText(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

export function formatNumber(value, fractionDigits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '--'
  }

  return Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  })
}

export function getInitialLocationState() {
  return {
    location: '',
    state: '',
    district: '',
    city: '',
    latitude: null,
    longitude: null,
  }
}

export function applySelectedLocation(current, suggestion) {
  return {
    ...current,
    location: suggestion?.displayName || suggestion?.label || current.location || '',
    state: suggestion?.state || current.state || '',
    district: suggestion?.district || current.district || '',
    city: suggestion?.city || suggestion?.label || current.city || '',
    latitude: suggestion?.lat ? Number(suggestion.lat) : current.latitude,
    longitude: suggestion?.lon ? Number(suggestion.lon) : current.longitude,
  }
}

export function getUrgencyTone(urgency) {
  if (urgency === 'CRITICAL' || urgency === 'HIGH') {
    return 'danger'
  }
  if (urgency === 'MEDIUM') {
    return 'warning'
  }
  return 'info'
}

export function getEligibilitySummary(donor) {
  if (!donor) {
    return 'Unknown'
  }
  if (donor.eligibleToDonate) {
    return donor.lastDonationDate ? `Eligible to donate. Last donation ${formatDate(donor.lastDonationDate)}` : 'Eligible to donate'
  }
  if (donor.eligibilityStatus) {
    return donor.eligibilityStatus
  }
  if (donor.nextEligibleDate && donor.nextEligibleDate !== 'N/A') {
    return `Next eligible on ${formatDate(donor.nextEligibleDate)}`
  }
  return 'Eligibility pending'
}
