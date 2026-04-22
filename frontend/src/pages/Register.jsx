import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { getApiData, getErrorMessage } from '../utils/app'
import toast from 'react-hot-toast'

const ROLES = [
  { value: 'DONOR', label: 'Donor', desc: 'I want to donate blood' },
  { value: 'PATIENT', label: 'Patient', desc: 'I need blood' },
]

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'DONOR' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const nextErrors = {}
    if (!form.name || form.name.trim().length < 2) nextErrors.name = 'Name must be at least 2 characters'
    if (!form.email) nextErrors.email = 'Email is required'
    if (!form.password || form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters'
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
      const response = await authAPI.register(form)
      login(getApiData(response, {}))
      toast.success('Account created! Welcome to LifeLink')
      navigate('/dashboard')
    } catch (error) {
      const message = getErrorMessage(error, 'Registration failed')
      toast.error(message)
      setErrors({ general: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-10">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-blood-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-60 h-60 bg-blood-800/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blood-500 to-blood-800 flex items-center justify-center shadow-xl shadow-blood-900/50 mb-4">
            <Heart size={22} className="text-white fill-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Join LifeLink</h1>
          <p className="text-sm text-gray-500 mt-1">Create your account to get started</p>
        </div>

        <div className="glass-card p-6">
          {errors.general && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-900/30 border border-red-800/50 text-red-300 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">I am a...</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(role => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setForm(current => ({ ...current, role: role.value }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.role === role.value
                        ? 'border-blood-600 bg-blood-900/40 text-white'
                        : 'border-white/10 bg-white/4 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <div className="text-sm font-semibold">{role.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{role.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
                  className={`input-field pl-10 ${errors.name ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={event => setForm(current => ({ ...current, email: event.target.value }))}
                  className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={event => setForm(current => ({ ...current, password: event.target.value }))}
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(value => !value)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
              ) : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-blood-400 hover:text-blood-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
