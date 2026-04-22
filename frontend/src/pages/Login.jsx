import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { getApiData, getErrorMessage } from '../utils/app'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const nextErrors = {}
    if (!form.email) nextErrors.email = 'Email is required'
    if (!form.password) nextErrors.password = 'Password is required'
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
      const response = await authAPI.login(form)
      const authData = getApiData(response, {})
      login(authData)
      toast.success(`Welcome back, ${authData.name || 'there'}!`)
      navigate('/dashboard')
    } catch (error) {
      const message = getErrorMessage(error, 'Login failed')
      toast.error(message)
      setErrors({ general: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-blood-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-60 h-60 bg-blood-800/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blood-500 to-blood-800 flex items-center justify-center shadow-xl shadow-blood-900/50 mb-4">
            <Heart size={22} className="text-white fill-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your LifeLink account</p>
        </div>

        <div className="glass-card p-6">
          {errors.general && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-900/30 border border-red-800/50 text-red-300 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <Link
                  to="/forgot-password"
                  className="hidden text-xs font-medium text-blood-400 transition-colors hover:text-blood-300"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  value={form.password}
                  onChange={event => setForm(current => ({ ...current, password: event.target.value }))}
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  autoComplete="current-password"
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
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 p-3 rounded-xl bg-white/4 border border-white/8">
            <p className="text-xs text-gray-500 font-medium mb-1.5">Demo credentials</p>
            <p className="text-xs text-gray-400 font-mono">admin@lifelink.com / admin123</p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          No account?{' '}
          <Link to="/register" className="text-blood-400 hover:text-blood-300 font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
