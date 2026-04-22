import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Heart, Mail, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'
import { getErrorMessage } from '../utils/app'

const MIN_EMAIL_LENGTH = 5

export default function ForgotPassword() {
  const [searchParams] = useSearchParams()
  const initialEmail = useMemo(() => searchParams.get('email') || '', [searchParams])
  const [email, setEmail] = useState(initialEmail)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const validate = () => {
    const normalizedEmail = email.trim()

    if (!normalizedEmail) {
      setError('Email is required')
      return false
    }

    if (normalizedEmail.length < MIN_EMAIL_LENGTH || !normalizedEmail.includes('@')) {
      setError('Enter a valid email address')
      return false
    }

    setError('')
    return true
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) {
      return
    }

    setLoading(true)
    try {
      await authAPI.forgotPassword(email.trim())
      setSuccess(true)
      toast.success('If that account exists, a reset link has been sent.')
    } catch (requestError) {
      const message = getErrorMessage(requestError, 'Unable to send reset link')
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-blood-900/20 blur-3xl" />
        <div className="absolute bottom-16 right-1/4 h-64 w-64 rounded-full bg-blood-700/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blood-500 to-blood-800 shadow-xl shadow-blood-900/50">
            <Heart size={22} className="fill-white text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Forgot your password?</h1>
          <p className="mt-1 text-center text-sm text-gray-500">
            Enter your email and we&apos;ll send you a secure reset link.
          </p>
        </div>

        <div className="glass-card p-6">
          {success ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-800/50 bg-emerald-900/20 px-4 py-4 text-sm text-emerald-200">
                If an account exists for <span className="font-semibold">{email.trim()}</span>, a reset link has been sent.
                Please check your inbox and spam folder.
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="btn-ghost w-full"
              >
                {loading ? 'Sending...' : 'Resend reset link'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <div className="relative">
                  <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value)
                      if (error) {
                        setError('')
                      }
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={`input-field pl-10 ${error ? 'border-red-500' : ''}`}
                  />
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex w-full items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Sending link...</>
                ) : 'Send reset link'}
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
