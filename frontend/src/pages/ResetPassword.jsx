import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Heart, Lock, RefreshCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'
import { getErrorMessage } from '../utils/app'

const MIN_PASSWORD_LENGTH = 6

export default function ResetPassword() {
  const { token = '' } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [isValidLink, setIsValidLink] = useState(true)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState({})

  const passwordHint = useMemo(
    () => `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
    []
  )

  useEffect(() => {
    let ignore = false

    const validateToken = async () => {
      if (!token) {
        setIsValidLink(false)
        setValidating(false)
        return
      }

      try {
        await authAPI.validateResetToken(token)
        if (!ignore) {
          setIsValidLink(true)
        }
      } catch (error) {
        if (!ignore) {
          setIsValidLink(false)
          setErrors({ general: getErrorMessage(error, 'Reset link is invalid or has expired') })
        }
      } finally {
        if (!ignore) {
          setValidating(false)
        }
      }
    }

    validateToken()
    return () => {
      ignore = true
    }
  }, [token])

  const validate = () => {
    const nextErrors = {}

    if (!form.newPassword) {
      nextErrors.newPassword = 'New password is required'
    } else if (form.newPassword.length < MIN_PASSWORD_LENGTH) {
      nextErrors.newPassword = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your new password'
    } else if (form.newPassword !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match'
    }

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
      await authAPI.resetPassword(token, form.newPassword)
      setSuccess(true)
      toast.success('Password updated successfully. Please sign in.')
      setTimeout(() => navigate('/login'), 1400)
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to reset password')
      setErrors({ general: message })
      if (/expired|invalid/i.test(message)) {
        setIsValidLink(false)
      }
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
        <div className="glass-card w-full max-w-sm p-6 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-blood-700 border-t-transparent" />
          <p className="text-sm text-gray-400">Validating your reset link...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-24 right-1/4 h-80 w-80 rounded-full bg-blood-900/20 blur-3xl" />
        <div className="absolute bottom-20 left-1/4 h-64 w-64 rounded-full bg-blood-700/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blood-500 to-blood-800 shadow-xl shadow-blood-900/50">
            <Heart size={22} className="fill-white text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Set a new password</h1>
          <p className="mt-1 text-center text-sm text-gray-500">
            Choose a strong password for your LifeLink account.
          </p>
        </div>

        <div className="glass-card p-6">
          {!isValidLink ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-red-800/50 bg-red-900/20 px-4 py-4 text-sm text-red-200">
                {errors.general || 'This reset link is invalid or has expired.'}
              </div>

              <Link
                to="/forgot-password"
                className="btn-primary flex w-full items-center justify-center gap-2"
              >
                <RefreshCcw size={16} />
                Request a new link
              </Link>
            </div>
          ) : success ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-800/50 bg-emerald-900/20 px-4 py-4 text-sm text-emerald-200">
                Your password has been updated successfully. Redirecting you to login...
              </div>
              <Link to="/login" className="btn-ghost flex w-full items-center justify-center">
                Go to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="rounded-2xl border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-300">
                  {errors.general}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">New password</label>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.newPassword}
                    onChange={(event) => setForm((current) => ({ ...current, newPassword: event.target.value }))}
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                    className={`input-field pl-10 pr-10 ${errors.newPassword ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">{passwordHint}</p>
                {errors.newPassword && <p className="text-xs text-red-400">{errors.newPassword}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Confirm password</label>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                    className={`input-field pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex w-full items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Updating password...</>
                ) : 'Reset password'}
              </button>
            </form>
          )}
        </div>

        <p className="mt-5 flex items-center justify-center gap-2 text-sm text-gray-500">
          <ArrowLeft size={16} />
          <Link to="/login" className="font-medium text-blood-400 hover:text-blood-300">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
