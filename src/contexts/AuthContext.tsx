import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ApiError, credentials, encodeBasic, UNAUTHORIZED_EVENT } from '../services/api'
import { userService } from '../services/userService'
import type { User } from '../types/api'

interface AuthContextValue {
  user: User | null
  /** True while restoring a session from stored credentials */
  initializing: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  /** Replace the stored user (and credentials, when email/password change) */
  refresh: (user: User, password?: string) => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [initializing, setInitializing] = useState(() => credentials.get() !== null)

  useEffect(() => {
    if (!credentials.get()) return
    userService
      .me()
      .then(setUser)
      // Only invalid credentials drop the stored token; a network/server failure keeps it for the next load
      .catch((error) => {
        if (error instanceof ApiError && error.status === 401) credentials.clear()
      })
      .finally(() => setInitializing(false))
  }, [])

  const logout = useCallback(() => {
    credentials.clear()
    setUser(null)
  }, [])

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout)
  }, [logout])

  const login = useCallback(async (email: string, password: string) => {
    const token = encodeBasic(email, password)
    const me = await userService.me(token)
    credentials.set(token)
    setUser(me)
  }, [])

  const refresh = useCallback((next: User, password?: string) => {
    if (password !== undefined) credentials.set(encodeBasic(next.email, password))
    setUser(next)
  }, [])

  const value = useMemo(
    () => ({ user, initializing, login, logout, refresh }),
    [user, initializing, login, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
