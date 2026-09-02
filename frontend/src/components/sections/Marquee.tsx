import { MARQUEE_ITEMS } from '../../constants'

/** Infinite scrolling band of care services. */
export function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]
  return (
    <section className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {items.map((item, i) => (
          <span className="marquee-item" key={i}>
            {item} <em>✦</em>
          </span>
        ))}
      </div>
    </section>
  )
}