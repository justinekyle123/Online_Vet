import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../../lib/motion'
import landingHero from '../../assets/landing/pet.jpg'

/** Hero photo with gentle scroll parallax — the artwork drifts up slower than the page. */
export function HeroArt() {
  const artRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const node = artRef.current
    if (!node || prefersReducedMotion()) return
    let raf = 0
    const onScroll = (): void => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = window.scrollY
        if (y < window.innerHeight) {
          node.style.transform = `translate3d(0, ${(y * -0.07).toFixed(1)}px, 0)`
        } else {
          node.style.transform = ''
        }
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="hero-art" ref={artRef}>
      <img src={landingHero} alt="A joyful group of pets enjoying care at PawCare" />
    </div>
  )
}