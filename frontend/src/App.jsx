import { useEffect, useState } from 'react'
import './App.css'

const fallbackContent = {
  brand: 'PawCare',
  eyebrow: 'Trusted care for every companion',
  title: 'A healthier, happier life for your best friend.',
  description:
    'Compassionate veterinary care, modern medicine, and a team that treats every pet like family.',
  primaryCta: 'Book an appointment',
  secondaryCta: 'Explore our care',
  stats: [
    { value: '15+', label: 'Years of care' },
    { value: '24/7', label: 'Emergency support' },
    { value: '4.9/5', label: 'Pet parent rating' },
  ],
}

function App() {
  const [content, setContent] = useState(fallbackContent)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/landing`)
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load landing content')
        return response.json()
      })
      .then(setContent)
      .catch(() => {})
  }, [])

  return (
    <main>
      <nav className="navbar">
        <a className="brand" href="#top"><span>✦</span> {content.brand}</a>
        <div className="nav-links">
          <a href="#services">Services</a>
          <a href="#about">About us</a>
          <a href="#contact">Contact</a>
        </div>
        <a className="nav-button" href="#contact">Get in touch <span>↗</span></a>
      </nav>

      <section className="hero-section" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> {content.eyebrow}</p>
          <h1>{content.title}</h1>
          <p className="hero-description">{content.description}</p>
          <div className="hero-actions">
            <a className="primary-button" href="#contact">{content.primaryCta} <span>↗</span></a>
            <a className="text-button" href="#services">{content.secondaryCta} <span>↓</span></a>
          </div>
          <div className="stats">
            {content.stats.map((stat) => <div key={stat.label}><strong>{stat.value}</strong><small>{stat.label}</small></div>)}
          </div>
        </div>
        <div className="hero-art" aria-label="Happy dog at PawCare" role="img">
          <div className="sun" /><div className="blob blob-one" /><div className="blob blob-two" />
          <div className="dog">🐶</div><div className="flower flower-one">✿</div><div className="flower flower-two">✿</div>
        </div>
      </section>

      <section className="trust-row"><p>Care that goes beyond the clinic</p><div><span>♥</span> Pet parents choose PawCare</div><div><span>✚</span> Gentle. Modern. Personal.</div></section>

      <section className="services" id="services">
        <p className="eyebrow">How we help</p><h2>Everything they need.<br /><em>All in one place.</em></h2>
        <div className="service-grid"><article><span className="service-icon">✚</span><h3>Preventive care</h3><p>Wellness exams, vaccines, and nutrition plans to keep tails wagging.</p></article><article><span className="service-icon">♡</span><h3>Compassionate treatment</h3><p>Thoughtful diagnostics and treatment plans for every stage of life.</p></article><article><span className="service-icon">✦</span><h3>Urgent support</h3><p>When the unexpected happens, our experienced team is here to help.</p></article></div>
      </section>

      <footer id="contact"><div><a className="brand" href="#top"><span>✦</span> {content.brand}</a><p>Better care. Brighter days.<br />For every beloved companion.</p></div><div><strong>Ready to get started?</strong><a className="primary-button" href="mailto:hello@pawcare.example">Book a visit <span>↗</span></a></div></footer>
    </main>
  )
}

export default App
