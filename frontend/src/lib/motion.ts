import { NAV_OFFSET } from '../constants'

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Eased `window.scrollTo` so anchor navigation feels buttery instead of instant. */
export function smoothScrollTo(targetY: number): void {
  const startY = window.scrollY
  const diff = targetY - startY
  if (Math.abs(diff) < 2 || prefersReducedMotion()) {
    window.scrollTo(0, targetY)
    return
  }
  const duration = Math.min(1400, Math.max(650, Math.abs(diff) * 0.55))
  const start = performance.now()
  const ease = (t: number): number => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2) // easeInOutCubic
  const step = (now: number): void => {
    const t = Math.min(1, (now - start) / duration)
    window.scrollTo(0, Math.round(startY + diff * ease(t)))
    if (t < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

/** Computes the eased scroll target for an in-page anchor href, or null if invalid. */
export function anchorScrollTarget(href: string): number | null {
  if (href === '#top' || href === '#') return 0
  const el = document.querySelector(href)
  if (!el) return null
  return Math.max(0, el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET)
}
