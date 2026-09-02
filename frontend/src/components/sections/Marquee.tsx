import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { MARQUEE_ITEMS } from '../../constants'

export function Marquee() {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  // Trigger the staggered item entrance once the band scrolls into view.
  useEffect(() => {
    const node = trackRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -15% 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]
  return (
    <section className="marquee" aria-hidden="true">
      <div className="marquee-track" ref={trackRef}>
        {items.map((item, i) => (
          <span
            className={`marquee-item${visible ? ' is-visible' : ''}`}
            style={{ '--i': i % MARQUEE_ITEMS.length } as CSSProperties}
            key={i}
          >
            {item} <em>✦</em>
          </span>
        ))}
      </div>
    </section>
  )
}
