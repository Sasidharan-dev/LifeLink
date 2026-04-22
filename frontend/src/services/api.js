import axios from 'axios'

const AUTH_STORAGE_KEY = 'lifelink_token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Attach JWT on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_STORAGE_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Global response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || ''
    const isAuthRoute = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register')

    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      localStorage.removeItem('lifelink_user')

      const isAlreadyOnLogin = window.location.pathname === '/login'
      if (!isAlreadyOnLogin) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// ── Auth ────────────────────────────────────────────────
export const authAPI = {
  register:          (data) => api.post('/auth/register', data),
  login:             (data) => api.post('/auth/login', data),
  me:                () => api.get('/auth/me'),
  forgotPassword:    (email) => api.post('/auth/forgot-password', { email }),
  resetPassword:     (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  validateResetToken:(token) => api.get(`/auth/reset-password/${token}/validate`),
}

// ── Donors ──────────────────────────────────────────────
export const donorAPI = {
  getAll:             ()       => api.get('/donors'),
  getFilterOptions:   (params) => api.get('/donors/filters', { params }),
  getById:            (id)     => api.get(`/donors/${id}`),
  getMe:              ()       => api.get('/donors/me'),
  search:             (params) => api.get('/donors/search', { params }),
  create:             (data)   => api.post('/donors', data),
  update:             (id, data) => api.put(`/donors/${id}`, data),
  toggleAvailability: (id)     => api.put(`/donors/${id}/toggle-availability`),
  delete:             (id)     => api.delete(`/donors/${id}`),
}

export const locationAPI = {
  search: (query) => api.get('/locations/search', { params: { q: query } }),
}

// ── Blood Requests ───────────────────────────────────────
export const requestAPI = {
  getAll:       (params) => api.get('/requests', { params }),
  getById:      (id)     => api.get(`/requests/${id}`),
  getEmergency: ()       => api.get('/requests/emergency'),
  getMyRequests:()       => api.get('/requests/me'),
  create:       (data)   => api.post('/requests', data),
  updateStatus: (id, status) => api.put(`/requests/${id}/status`, { status }),
  delete:       (id)     => api.delete(`/requests/${id}`),
}

// ── Dashboard ────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
}

// ── Messages ─────────────────────────────────────────────
export const messageAPI = {
  send:            (data)      => api.post('/messages', data),
  getConversation: (userId)    => api.get(`/messages/conversation/${userId}`),
  getUnreadCount:  ()          => api.get('/messages/unread-count'),
}

// ── Admin ─────────────────────────────────────────────────
export const adminAPI = {
  getUsers:      () => api.get('/admin/users'),
  deleteUser:    (id) => api.delete(`/admin/users/${id}`),
  getDonors:     () => api.get('/admin/donors'),
  deleteDonor:   (id) => api.delete(`/admin/donors/${id}`),
  getRequests:   () => api.get('/admin/requests'),
  deleteRequest: (id) => api.delete(`/admin/requests/${id}`),
}
