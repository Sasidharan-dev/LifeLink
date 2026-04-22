import { Loader2 } from 'lucide-react'

// ── Spinner ─────────────────────────────────────────────
export function Spinner({ size = 20, className = '' }) {
  return <Loader2 size={size} className={`animate-spin ${className}`} />
}

export function InlineSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <Spinner size={16} className="text-blood-400" />
      <span>{label}</span>
    </div>
  )
}

// ── Button ───────────────────────────────────────────────
export function Button({ children, variant = 'primary', loading = false, className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none'
  const variants = {
    primary: 'px-5 py-2.5 bg-blood-700 hover:bg-blood-600 text-white focus:ring-2 focus:ring-blood-500 focus:ring-offset-2 focus:ring-offset-[#141414]',
    ghost:   'px-5 py-2.5 text-gray-300 hover:text-white hover:bg-white/10',
    danger:  'px-5 py-2.5 bg-red-700 hover:bg-red-600 text-white',
    outline: 'px-5 py-2.5 border border-white/15 text-gray-300 hover:border-blood-700 hover:text-white',
    sm:      'px-3 py-1.5 text-sm bg-blood-700 hover:bg-blood-600 text-white',
  }
  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Spinner size={16} />}
      {children}
    </button>
  )
}

// ── Input ────────────────────────────────────────────────
export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <input
        className={`input-field ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

// ── Select ───────────────────────────────────────────────
export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <select
        className={`select-field ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

// ── Card ─────────────────────────────────────────────────
export function Card({ children, className = '', ...props }) {
  return (
    <div className={`glass-card p-5 ${className}`} {...props}>
      {children}
    </div>
  )
}

// ── Skeleton ─────────────────────────────────────────────
export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />
}

export function SkeletonCard() {
  return (
    <div className="glass-card p-5 space-y-3">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-3/4" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────
export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default:   'bg-gray-800 text-gray-300 border-gray-700',
    blood:     'bg-blood-900/60 text-blood-300 border-blood-800/50',
    success:   'bg-emerald-900/60 text-emerald-300 border-emerald-800/50',
    warning:   'bg-amber-900/60 text-amber-300 border-amber-800/50',
    danger:    'bg-red-900/60 text-red-300 border-red-800/50',
    info:      'bg-blue-900/60 text-blue-300 border-blue-800/50',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  )
}

// ── Empty state ───────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <Icon size={28} className="text-gray-500" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-300 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-xs mb-4">{description}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ title = 'Something went wrong', description, action }) {
  return (
    <div className="glass-card p-8 text-center">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && <p className="text-sm text-gray-400 mt-2">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ── Page header ───────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-8">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-gray-400 mt-1 text-sm">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

// ── Urgency badge ─────────────────────────────────────────
export function UrgencyBadge({ urgency }) {
  const map = {
    LOW:      { label: 'Low',      cls: 'bg-blue-900/60 text-blue-300 border-blue-800/50' },
    MEDIUM:   { label: 'Medium',   cls: 'bg-amber-900/60 text-amber-300 border-amber-800/50' },
    HIGH:     { label: 'High',     cls: 'bg-orange-900/60 text-orange-300 border-orange-800/50' },
    CRITICAL: { label: 'Critical', cls: 'bg-red-900/80 text-red-200 border-red-700/60 animate-pulse-slow' },
  }
  const { label, cls } = map[urgency] || map.MEDIUM
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${cls}`}>
      {label}
    </span>
  )
}

// ── Status badge ──────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    PENDING:   { label: 'Pending',   cls: 'bg-amber-900/60 text-amber-300 border-amber-800/50' },
    FULFILLED: { label: 'Fulfilled', cls: 'bg-blue-900/60 text-blue-300 border-blue-800/50' },
    COMPLETED: { label: 'Completed', cls: 'bg-emerald-900/60 text-emerald-300 border-emerald-800/50' },
    CANCELLED: { label: 'Cancelled', cls: 'bg-gray-800/60 text-gray-400 border-gray-700/50' },
  }
  const { label, cls } = map[status] || map.PENDING
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${cls}`}>
      {label}
    </span>
  )
}

// ── Blood group pill ──────────────────────────────────────
export function BloodGroupPill({ group }) {
  return (
    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blood-900/60 border border-blood-800/50 text-blood-300 font-mono font-bold text-sm">
      {group || '--'}
    </span>
  )
}

export function HighlightedText({ text = '', query = '' }) {
  if (!query?.trim()) {
    return text || '--'
  }

  const safeText = text || ''
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = safeText.split(new RegExp(`(${escapedQuery})`, 'gi'))

  return parts.map((part, index) => (
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={`${part}-${index}`} className="rounded bg-blood-500/20 px-0.5 text-blood-200">{part}</mark>
      : <span key={`${part}-${index}`}>{part}</span>
  ))
}

export function SimpleBarChart({ items, emptyLabel = 'No data available yet' }) {
  const total = items.reduce((sum, item) => sum + item.value, 0)

  if (!items.length || total === 0) {
    return <p className="text-sm text-gray-500">{emptyLabel}</p>
  }

  return (
    <div className="space-y-3">
      {items.map(item => {
        const percentage = Math.round((item.value / total) * 100)
        return (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/8">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${item.color || 'from-blood-700 to-blood-500'}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
