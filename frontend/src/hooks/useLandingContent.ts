import { useEffect, useState } from 'react'
import type { LandingContent } from '../types'
import { FALLBACK_CONTENT } from '../constants'
import { fetchLandingContent } from '../lib/api'

/** Loads landing content from the API, starting with the static fallback. */
export function useLandingContent(): LandingContent {
  const [content, setContent] = useState<LandingContent>(FALLBACK_CONTENT)

  useEffect(() => {
    let cancelled = false
    fetchLandingContent().then((data) => {
      if (!cancelled) setContent(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return content
}
