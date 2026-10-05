import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { FullScreenLoading } from '../components/Loading'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute() {
  const { user, initializing } = useAuth()
  const location = useLocation()
  if (initializing) return <FullScreenLoading />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

export function PublicOnlyRoute() {
  const { user, initializing } = useAuth()
  if (initializing) return <FullScreenLoading />
  if (user) return <Navigate to="/" replace />
  return <Outlet />
}
