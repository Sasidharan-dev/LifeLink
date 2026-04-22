import { useEffect, useRef, useState } from 'react'
import { Loader2, MapPin } from 'lucide-react'
import { locationAPI } from '../services/api'
import { getApiData } from '../utils/app'

export default function LocationAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Search city or location',
  className = '',
  inputClassName = '',
  minChars = 2,
}) {
  const [search, setSearch] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const requestIdRef = useRef(0)
  const blurTimeoutRef = useRef(null)

  useEffect(() => {
    setSearch(value || '')
  }, [value])

  useEffect(() => {
    const query = search.trim()

    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
    }

    if (query.length < minChars) {
      setSuggestions([])
      setLoading(false)
      setError('')
      setOpen(false)
      setActiveIndex(-1)
      return undefined
    }

    const currentRequestId = ++requestIdRef.current
    const timeoutId = setTimeout(async () => {
      setLoading(true)
      setError('')

      try {
        const response = await locationAPI.search(query)
        if (requestIdRef.current !== currentRequestId) {
          return
        }

        const nextSuggestions = getApiData(response, []).map((item, index) => ({
          id: `${item.displayName || item.label || index}`,
          label: item.label || item.city || item.displayName?.split(',')[0] || '',
          city: item.city || item.label || '',
          district: item.district || '',
          state: item.state || '',
          country: item.country || '',
          displayName: item.displayName || '',
          lat: item.lat || '',
          lon: item.lon || '',
        }))

        setSuggestions(nextSuggestions)
        setOpen(true)
        setActiveIndex(nextSuggestions.length ? 0 : -1)
      } catch {
        if (requestIdRef.current !== currentRequestId) {
          return
        }
        setSuggestions([])
        setOpen(true)
        setError('Unable to load locations right now')
        setActiveIndex(-1)
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setLoading(false)
        }
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [minChars, search])

  useEffect(() => () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
    }
  }, [])

  const handleInputChange = (event) => {
    const nextValue = event.target.value
    setSearch(nextValue)
    onChange?.(nextValue)
    setOpen(nextValue.trim().length >= minChars)
    setActiveIndex(0)
  }

  const applySelection = (item) => {
    const nextValue = item.city || item.label || item.displayName || ''
    setSearch(nextValue)
    setSuggestions([])
    setOpen(false)
    setError('')
    setActiveIndex(-1)
    onChange?.(nextValue)
    onSelect?.(item)
  }

  const handleKeyDown = (event) => {
    if (!open || suggestions.length === 0) {
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex(current => (current + 1) % suggestions.length)
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex(current => (current <= 0 ? suggestions.length - 1 : current - 1))
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      applySelection(suggestions[activeIndex])
    }

    if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className={`relative w-full ${className}`}>
      <input
        type="text"
        value={search}
        onChange={handleInputChange}
        onFocus={() => {
          if (suggestions.length || error) {
            setOpen(true)
          }
        }}
        onBlur={() => {
          blurTimeoutRef.current = setTimeout(() => setOpen(false), 150)
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`input-field ${inputClassName}`}
        autoComplete="off"
      />

      {loading && (
        <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-gray-500" />
      )}

      {open && (
        <div className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-white/10 bg-[#181818]/95 shadow-2xl shadow-black/30 backdrop-blur-xl">
          {loading && suggestions.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-400">Searching locations...</div>
          )}

          {!loading && error && (
            <div className="px-4 py-3 text-sm text-red-300">{error}</div>
          )}

          {!loading && !error && suggestions.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">No locations found</div>
          )}

          {!error && suggestions.map(item => {
            const secondary = [item.district, item.state, item.country].filter(Boolean).join(', ')
            return (
              <button
                key={item.id}
                type="button"
                onMouseDown={() => applySelection(item)}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition-colors ${
                  suggestions[activeIndex]?.id === item.id
                    ? 'bg-blood-900/30 text-white'
                    : 'text-gray-300 hover:bg-white/8 hover:text-white'
                }`}
              >
                <MapPin size={14} className="mt-0.5 shrink-0 text-blood-400" />
                <span className="min-w-0">
                  <span className="block truncate">{item.label}</span>
                  {secondary && <span className="mt-0.5 block truncate text-xs text-gray-500">{secondary}</span>}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
