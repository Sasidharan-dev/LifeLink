import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

import Layout       from './components/Layout'
import Footer       from './components/Footer'
import Login        from './pages/Login'
import Register     from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard    from './pages/Dashboard'
import Donors       from './pages/Donors'
import DonorProfile from './pages/DonorProfile'
import Requests     from './pages/Requests'
import NewRequest   from './pages/NewRequest'
import Chat         from './pages/Chat'
import AdminPanel   from './pages/AdminPanel'
import Landing      from './pages/Landing'
import NotFound     from './pages/NotFound'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <FullPageSpinner />
  return user ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <FullPageSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

function GuestRoute({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to="/dashboard" replace /> : children
}

function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f]">
      <div className="w-10 h-10 border-2 border-blood-700 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function ChatRedirect() {
  const { userId } = useParams()
  return <Navigate to={userId ? `/messages/${userId}` : '/messages'} replace />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">
            <Routes>
              {/* Public landing */}
              <Route path="/" element={<Landing />} />

              {/* Guest-only */}
              <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Protected layout */}
              <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route path="dashboard"       element={<Dashboard />} />
                <Route path="donors"          element={<Donors />} />
                <Route path="donors/new"      element={<DonorProfile />} />
                <Route path="donors/:id/edit" element={<DonorProfile />} />
                <Route path="requests"        element={<Requests />} />
                <Route path="requests/new"    element={<NewRequest />} />
                <Route path="chat"            element={<ChatRedirect />} />
                <Route path="chat/:userId"    element={<ChatRedirect />} />
                <Route path="messages"        element={<Chat />} />
                <Route path="messages/:userId" element={<Chat />} />
              </Route>

              {/* Admin */}
              <Route path="/admin" element={<AdminRoute><Layout /></AdminRoute>}>
                <Route index element={<AdminPanel />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}
