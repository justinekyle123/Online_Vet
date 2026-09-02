import { useEffect, useState } from 'react'
import type { UiState } from '../types'
import { NAV_ITEMS } from '../constants'

/** One scroll listener drives navbar state, progress bar, scrollspy and back-to-top. */
export function useScrollUi(): UiState {
  const [ui, setUi] = useState<UiState>({ scrolled: false, progress: 0, showTop: false, active: '' })

  useEffect(() => {
    const onScroll = (): void => {
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      const probe = y + window.innerHeight * 0.4
      let active = ''
      for (const { id } of NAV_ITEMS) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= probe) active = id
      }
      setUi({
        scrolled: y > 24,
        progress: max > 0 ? Math.min(1, y / max) : 0,
        showTop: y > 700,
        active,
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return ui
}
