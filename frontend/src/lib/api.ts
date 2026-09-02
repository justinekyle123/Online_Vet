import type { LandingContent } from '../types'
import { FALLBACK_CONTENT } from '../constants'

const API_BASE = import.meta.env.VITE_API_URL || ''

/** Fetches landing content from the API, falling back to static content on failure. */
export async function fetchLandingContent(): Promise<LandingContent> {
  try {
    const response = await fetch(`${API_BASE}/api/landing`)
    if (!response.ok) throw new Error(`API responded with ${response.status}`)
    return { ...FALLBACK_CONTENT, ...(await response.json()) }
  } catch {
    return FALLBACK_CONTENT
  }
}

/* ---------------- Auth ---------------- */

export interface AuthUser {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string | null
  role: 'owner' | 'veterinarian' | 'staff' | 'admin'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AuthSession {
  user: AuthUser
  token: string
}

export interface RegisterInput {
  first_name: string
  last_name: string
  email: string
  password: string
  phone?: string
}

const TOKEN_KEY = 'pawcare_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

interface ApiErrorBody {
  error?: unknown
}

/** JSON request with the stored bearer token attached. Throws with the API's error message. */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  const token = getStoredToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const body = (await response.json()) as ApiErrorBody
      if (typeof body.error === 'string') message = body.error
    } catch {
      // keep the fallback message
    }
    throw new Error(message)
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

/** Creates an account; the returned token logs the user in immediately. */
export function registerUser(input: RegisterInput): Promise<{ data: AuthSession }> {
  return request('/api/auth/register', { method: 'POST', body: JSON.stringify(input) })
}

export function loginUser(email: string, password: string): Promise<{ data: AuthSession }> {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

/** Restores the current user from the stored token (401 clears the session). */
export function fetchCurrentUser(): Promise<{ data: AuthUser }> {
  return request('/api/auth/me')
}

export function logoutRequest(): Promise<void> {
  return request('/api/auth/logout', { method: 'POST' })
}

/* ---------------- Pets ---------------- */

export interface Pet {
  id: number
  owner_id: number
  name: string
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'reptile' | 'other'
  breed: string | null
  sex: 'male' | 'female' | 'unknown'
  date_of_birth: string | null
  color: string | null
  microchip_number: string | null
  weight_kg: string | null
  allergies: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

/** Fetches the pets owned by the given user id. */
export function fetchPets(ownerId: number): Promise<{ data: Pet[] }> {
  return request(`/api/pets?owner_id=${ownerId}`)
}

export interface PetInput {
  name: string
  species: Pet['species']
  breed?: string
  sex?: Pet['sex']
  date_of_birth?: string
  weight_kg?: string
  notes?: string
}

/** Creates a pet owned by the given user id. */
export function createPet(ownerId: number, input: PetInput): Promise<{ data: Pet }> {
  return request('/api/pets', {
    method: 'POST',
    body: JSON.stringify({ owner_id: ownerId, ...input }),
  })
}

/** Hard-deletes a pet (server also removes dependent records). */
export function deletePet(petId: number): Promise<void> {
  return request(`/api/pets/${petId}`, { method: 'DELETE' })
}