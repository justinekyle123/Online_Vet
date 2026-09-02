import { createContext, useContext } from 'react'
import type { AuthUser, RegisterInput } from '../lib/api'

export interface AuthContextValue {
  user: AuthUser | null
  /** True while the session is being restored from the stored token. */
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}