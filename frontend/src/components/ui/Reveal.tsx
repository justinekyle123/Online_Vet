import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { prefersReducedMotion } from '../../lib/motion'

/** Adds `is-visible` once the element scrolls into view (with a stagger delay). */
function useReveal() {
  const ref = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    node.classList.add('reveal')
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add('is-visible')
          observer.unobserve(node)
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return ref
}

interface RevealProps {
  as?: 'div' | 'header' | 'article' | 'figure' | 'section'
  delay?: number
  className?: string
  children: ReactNode
  style?: CSSProperties
  [key: string]: unknown
}

export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, style, ...rest }: RevealProps) {
  const ref = useReveal()
  const { ...htmlProps } = rest as Record<string, unknown>
  return (
    <Tag
      ref={ref as never}
      className={className}
      style={{ transitionDelay: `${delay}ms`, ...style }}
      {...htmlProps}
    >
      {children}
    </Tag>
  )
}

/** Splits "15+" / "4.9/5" into a numeric prefix + suffix so stats can count up. */
function parseStat(value: string): { num: number | null; decimals: number; suffix: string } {
  const match = value.match(/^(-?\d+(?:\.\d+)?)(.*)$/)
  if (!match) return { num: null, decimals: 0, suffix: value }
  return {
    num: parseFloat(match[1]),
    decimals: (match[1].split('.')[1] || '').length,
    suffix: match[2],
  }
}

interface StatProps {
  value: string
  label: string
  delay: number
}

export function Stat({ value, label, delay }: StatProps) {
  const { num, decimals, suffix } = parseStat(value)
  const ref = useRef<HTMLDivElement | null>(null)
  const [display, setDisplay] = useState(() => {
    if (num === null || prefersReducedMotion()) return value
    return (0).toFixed(decimals) + suffix
  })

  useEffect(() => {
    const node = ref.current
    if (!node || num === null) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const duration = 1600
        const start = performance.now()
        const ease = (t: number): number => (t === 1 ? 1 : 1 - 2 ** (-10 * t)) // easeOutExpo
        const tick = (now: number): void => {
          const t = Math.min(1, (now - start) / duration)
          setDisplay((num * ease(t)).toFixed(decimals) + suffix)
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.6 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [num, decimals, suffix, value])

  return (
    <div className="stat" ref={ref} style={{ '--stat-delay': `${delay}ms` } as CSSProperties}>
      <strong>{display}</strong>
      <small>{label}</small>
    </div>
  )
}
