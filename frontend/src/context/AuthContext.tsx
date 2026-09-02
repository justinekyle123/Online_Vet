import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthUser, RegisterInput } from '../lib/api'
import {
  clearStoredToken,
  fetchCurrentUser,
  getStoredToken,
  loginUser,
  logoutRequest,
  registerUser,
  storeToken,
} from '../lib/api'
import { AuthContext } from './auth-context'
import type { AuthContextValue } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  // Starts true only when a token exists, so pages don't flash before the restore.
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(() => getStoredToken() !== null)

  useEffect(() => {
    let cancelled = false
    const token = getStoredToken()
    if (!token) return

    fetchCurrentUser()
      .then(({ data }) => {
        if (!cancelled) setUser(data)
      })
      .catch(() => {
        // Token is invalid or expired — drop it
        if (!cancelled) clearStoredToken()
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await loginUser(email, password)
    storeToken(data.token)
    setUser(data.user)
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    const { data } = await registerUser(input)
    storeToken(data.token)
    setUser(data.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } catch {
      // The token may already be invalid — clear locally regardless
    }
    clearStoredToken()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}