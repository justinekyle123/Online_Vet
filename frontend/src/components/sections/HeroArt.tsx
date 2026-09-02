import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { prefersReducedMotion } from '../../lib/motion'
import parrotImage from '../../assets/carousel/parot.jpg'
import catImage from '../../assets/carousel/cat.jpg'
import dogTwoImage from '../../assets/carousel/dog2.jpg'
import dogOneImage from '../../assets/carousel/dog1.jpg'
import guineaPigImage from '../../assets/carousel/genpig.jpg'
import dogThreeImage from '../../assets/carousel/dog3.jpg'

const carouselImages = [
  { src: parrotImage, alt: 'A parrot receiving gentle care at PawCare' },
  { src: catImage, alt: 'A cat relaxing at PawCare' },
  { src: dogTwoImage, alt: 'A happy dog at PawCare' },
  { src: dogOneImage, alt: 'A dog enjoying compassionate care at PawCare' },
  { src: guineaPigImage, alt: 'A guinea pig receiving thoughtful care at PawCare' },
  { src: dogThreeImage, alt: 'A joyful dog at PawCare' },
]

/** Hero carousel with gentle scroll parallax and automatic image rotation. */
export function HeroArt() {
  const artRef = useRef<HTMLDivElement | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [direction, setDirection] = useState(1)

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

  useEffect(() => {
    if (isPaused || prefersReducedMotion() || document.hidden) return
    const timer = window.setInterval(() => {
      setDirection(1)
      setActiveIndex((current) => (current + 1) % carouselImages.length)
    }, 5000)
    return () => window.clearInterval(timer)
  }, [activeIndex, isPaused])

  useEffect(() => {
    const onVisibilityChange = (): void => {
      if (document.hidden) setIsPaused(true)
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  const showSlide = (index: number, slideDirection = 1): void => {
    setDirection(slideDirection >= 0 ? 1 : -1)
    setActiveIndex((index + carouselImages.length) % carouselImages.length)
  }

  const moveSlide = (slideDirection: number): void => {
    showSlide(activeIndex + slideDirection, slideDirection)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      moveSlide(-1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      moveSlide(1)
    }
  }

  return (
    <div
      className="hero-art"
      ref={artRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => { setIsFocused(true); setIsPaused(true) }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsFocused(false)
          setIsPaused(false)
        }
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="hero-carousel" aria-live={isFocused ? 'polite' : 'off'}>
        {carouselImages.map((image, index) => {
          const offset = (index - activeIndex + carouselImages.length) % carouselImages.length
          const position = offset === 0 ? 'active' : 'hidden'
          const isPrevious = offset === carouselImages.length - 1
          const transitionClass = position === 'active'
            ? `slide-${direction === 1 ? 'from-right' : 'from-left'}`
            : isPrevious
              ? `slide-${direction === 1 ? 'exit-left' : 'exit-right'}`
              : `slide-${direction === 1 ? 'from-right' : 'from-left'}`
          return (
            <img
              key={image.src}
              className={`hero-carousel-image hero-carousel-image-${position} ${transitionClass}`}
              src={image.src}
              alt={index === activeIndex ? image.alt : ''}
              aria-hidden={index !== activeIndex}
            />
          )
        })}
      </div>
      <div className="hero-carousel-controls" aria-label="Hero image carousel controls">
        <button type="button" onClick={() => moveSlide(-1)} aria-label="Previous image">←</button>
        <div className="hero-carousel-dots">
          {carouselImages.map((image, index) => (
            <button
              key={image.src}
              type="button"
              className={index === activeIndex ? 'is-active' : ''}
              onClick={() => showSlide(index, index > activeIndex ? 1 : -1)}
              aria-label={`Show image ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
            />
          ))}
        </div>
        <button type="button" onClick={() => moveSlide(1)} aria-label="Next image">→</button>
      </div>
      <span className="hero-carousel-status">{activeIndex + 1} / {carouselImages.length}</span>
    </div>
  )
}
