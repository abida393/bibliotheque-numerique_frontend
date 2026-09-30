import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'
import { LoadingScreen } from '@/components/loading-screen'

export function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()
  if (loading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/connexion" state={{ from: location }} replace />
  return children ?? <Outlet />
}

export function RequireAdmin({ children }) {
  const { isAdmin, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!isAdmin) return <Navigate to="/" replace />
  return children ?? <Outlet />
}

export function RequireModerator({ children }) {
  const { isModerator, isAdmin, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!isModerator && !isAdmin) return <Navigate to="/" replace />
  return children ?? <Outlet />
}

export function GuestOnly({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (isAuthenticated) return <Navigate to="/" replace />
  return children ?? <Outlet />
}
