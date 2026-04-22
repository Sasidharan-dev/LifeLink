import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'
import { getApiData } from '../utils/app'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hydrated, setHydrated] = useState(false)

  const persistSession = useCallback((nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)

    if (nextToken) {
      localStorage.setItem('lifelink_token', nextToken)
    } else {
      localStorage.removeItem('lifelink_token')
    }

    if (nextUser) {
      localStorage.setItem('lifelink_user', JSON.stringify(nextUser))
    } else {
      localStorage.removeItem('lifelink_user')
    }
  }, [])

  const normalizeAuthUser = useCallback((authData = {}) => ({
    id: authData.userId ?? authData.id ?? null,
    name: authData.name ?? '',
    email: authData.email ?? '',
    role: authData.role ?? '',
  }), [])

  useEffect(() => {
    const savedToken = localStorage.getItem('lifelink_token')
    const savedUser = localStorage.getItem('lifelink_user')

    if (savedToken) {
      let parsedUser = null

      if (savedUser) {
        try {
          parsedUser = JSON.parse(savedUser)
        } catch {
          localStorage.removeItem('lifelink_user')
        }
      }

      setToken(savedToken)
      setUser(parsedUser)
    }

    setHydrated(true)
  }, [])

  const refreshUser = useCallback(async () => {
    const savedToken = localStorage.getItem('lifelink_token')
    if (!savedToken) {
      return null
    }

    const response = await authAPI.me()
    const currentUser = getApiData(response, null)
    if (!currentUser) {
      return null
    }

    const normalizedUser = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
    }
    persistSession(savedToken, normalizedUser)
    return normalizedUser
  }, [persistSession])

  useEffect(() => {
    if (!hydrated) {
      return
    }

    if (!token) {
      setLoading(false)
      return
    }

    setLoading(true)
    refreshUser()
      .catch(() => {
        persistSession(null, null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [hydrated, token, refreshUser, persistSession])

  const login = useCallback((authData) => {
    persistSession(authData.token, normalizeAuthUser(authData))
  }, [normalizeAuthUser, persistSession])

  const updateUser = useCallback((nextUser) => {
    const mergedUser = {
      ...user,
      ...nextUser,
    }
    persistSession(token, mergedUser)
    return mergedUser
  }, [persistSession, token, user])

  const logout = useCallback(() => {
    persistSession(null, null)
  }, [persistSession])

  const isAdmin  = user?.role === 'ADMIN'
  const isDonor  = user?.role === 'DONOR'
  const isPatient = user?.role === 'PATIENT'

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, refreshUser, isAdmin, isDonor, isPatient }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
