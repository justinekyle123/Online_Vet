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
