import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../../lib/motion'

/** Hero illustration with gentle scroll + mouse parallax on depth layers. */
export function HeroArt() {
  const artRef = useRef<HTMLDivElement | null>(null)

  // Mouse parallax — layers drift against the cursor.
  useEffect(() => {
    const node = artRef.current
    if (!node) return
    const reduce = prefersReducedMotion()
    const onMove = (e: MouseEvent): void => {
      if (reduce) return
      const rect = node.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      node.querySelectorAll<HTMLElement>('[data-depth]').forEach((layer) => {
        const depth = Number(layer.dataset.depth)
        layer.style.translate = `${(-x * depth * 26).toFixed(1)}px ${(-y * depth * 18).toFixed(1)}px`
      })
    }
    node.addEventListener('mousemove', onMove)
    return () => node.removeEventListener('mousemove', onMove)
  }, [])

  // Scroll parallax — the whole artwork drifts up slower than the page.
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
    <div className="hero-art" ref={artRef} aria-label="A joyful group of pets at PawCare" role="img">
      <div className="ring" data-depth="0.35" />
      <div className="sun" />
      <div className="blob blob-one" />
      <div className="blob blob-two" />
      <div className="layer" data-depth="0.9">
        <div className="pet pet-cat">🐱</div>
      </div>
      <div className="layer" data-depth="0.55">
        <div className="pet pet-rabbit">🐰</div>
      </div>
      <div className="layer" data-depth="1.25">
        <div className="pet pet-bird">🦜</div>
      </div>
      <div className="layer" data-depth="0.65">
        <div className="flower flower-one">✿</div>
      </div>
      <div className="layer" data-depth="0.65">
        <div className="flower flower-two">✿</div>
      </div>
    </div>
  )
}
