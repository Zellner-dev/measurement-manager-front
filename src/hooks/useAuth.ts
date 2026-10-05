import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import type { User } from '../types/api'

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

/** For pages under ProtectedRoute, where the user is guaranteed to exist. */
export function useCurrentUser(): User {
  const { user } = useAuth()
  if (!user) throw new Error('useCurrentUser used outside a protected route')
  return user
}
