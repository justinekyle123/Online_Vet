import { useEffect } from 'react'
import { anchorScrollTarget, smoothScrollTo } from '../lib/motion'

/** Intercepts in-page anchor clicks and glides to the target with an eased animation. */
export function useSmoothAnchors(): void {
  useEffect(() => {
    const onClick = (e: MouseEvent): void => {
      const target = e.target as Element | null
      const link = target?.closest('a[href^="#"]')
      if (!link) return
      const href = link.getAttribute('href')
      if (!href) return
      const targetY = anchorScrollTarget(href)
      if (targetY === null) return
      e.preventDefault()
      smoothScrollTo(targetY)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
}
