import { useLandingContent } from './hooks/useLandingContent'
import { useScrollUi } from './hooks/useScrollUi'
import { useSmoothAnchors } from './hooks/useSmoothAnchors'
import { Reveal, Stat } from './components/ui/Reveal'
import { Headline } from './components/ui/Headline'
import { HeroArt } from './components/sections/HeroArt'
import { Marquee } from './components/sections/Marquee'
import { NAV_ITEMS } from './constants'
import './App.css'

function App() {
  const content = useLandingContent()
  const ui = useScrollUi()
  useSmoothAnchors()

  return (
    <main>
      <div className="scroll-progress" style={{ transform: `scaleX(${ui.progress})` }} aria-hidden="true" />
      <nav className={`navbar${ui.scrolled ? ' navbar-scrolled' : ''}`}>
        <a className="brand" href="#top"><span>✦</span> {content.brand}</a>
        <div className="nav-links">
          {NAV_ITEMS.map(({ id, label }) => (
            <a key={id} className={ui.active === id ? 'active' : ''} href={`#${id}`}>{label}</a>
          ))}
        </div>
        <a className="nav-button" href="#contact">Get in touch <span>↗</span></a>
      </nav>

      <section className="hero-section" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> {content.eyebrow}</p>
          <Headline text={content.title} />
          <p className="hero-description">{content.description}</p>
          <div className="hero-actions">
            <a className="primary-button" href="#contact">{content.primaryCta} <span>↗</span></a>
            <a className="text-button" href="#services">{content.secondaryCta} <span>↓</span></a>
          </div>
          <Reveal className="stats" delay={250}>
            {content.stats.map((stat, i) => (
              <Stat key={stat.label} value={stat.value} label={stat.label} delay={i * 130} />
            ))}
          </Reveal>
        </div>
        <HeroArt />
        <div className="scroll-hint" aria-hidden="true"><span /></div>
      </section>

      <Marquee />

      <section className="trust-row">
        <p>Thoughtful care for every kind of pet</p>
        <div><span>♥</span> Pet parents choose PawCare</div>
        <div><span>✚</span> Gentle. Modern. Personal.</div>
      </section>

      <section className="services" id="services">
        <Reveal as="header" className="section-head">
          <p className="eyebrow">How we help</p>
          <h2>Everything they need.<br /><em>All in one place.</em></h2>
        </Reveal>
        <div className="service-grid">
          <Reveal as="article" delay={0}>
            <span className="service-icon">✚</span>
            <h3>Preventive care</h3>
            <p>Wellness exams, vaccines, and nutrition plans to keep tails wagging.</p>
            <span className="service-link">Learn more →</span>
          </Reveal>
          <Reveal as="article" delay={120}>
            <span className="service-icon">♡</span>
            <h3>Compassionate treatment</h3>
            <p>Thoughtful diagnostics and treatment plans for every stage of life.</p>
            <span className="service-link">Learn more →</span>
          </Reveal>
          <Reveal as="article" delay={240}>
            <span className="service-icon">✦</span>
            <h3>Urgent support</h3>
            <p>When the unexpected happens, our experienced team is here to help.</p>
            <span className="service-link">Learn more →</span>
          </Reveal>
        </div>
      </section>

      <section className="about" id="about">
        <Reveal className="about-art" role="img" aria-label="A calm dog resting">
          <div className="about-card">🐕</div>
          <div className="about-badge">✦ Care that feels like home</div>
        </Reveal>
        <Reveal className="about-copy" delay={150}>
          <p className="eyebrow">Why PawCare</p>
          <h2>Care built around<br /><em>your pet, not a queue.</em></h2>
          <ul>
            <li><span>✚</span>Same-day visits and honest, jargon-free answers.</li>
            <li><span>✚</span>Calm, fear-free rooms designed for nervous pets.</li>
            <li><span>✚</span>A dedicated vet who knows your companion by name.</li>
          </ul>
          <a className="primary-button" href="#contact">Meet the team <span>↗</span></a>
        </Reveal>
      </section>

      <section className="testimonials" id="testimonials">
        <Reveal as="header" className="section-head">
          <p className="eyebrow">Happy tails</p>
          <h2>Stories from the<br /><em>people who love them.</em></h2>
        </Reveal>
        <div className="testimonial-grid">
          <Reveal as="figure" delay={0}>
            <blockquote>“They turned our anxious rescue into a dog who runs toward the clinic door. That says everything.”</blockquote>
            <figcaption>
              <span className="testimonial-avatar" aria-hidden="true">🐕</span>
              <span>Maya &amp; Rocket <small>· golden retriever, 4</small></span>
            </figcaption>
          </Reveal>
          <Reveal as="figure" delay={120}>
            <blockquote>“The 2am emergency line saved our cat's life. Calm voices, clear steps, and a follow-up call the next morning.”</blockquote>
            <figcaption>
              <span className="testimonial-avatar" aria-hidden="true">🐈</span>
              <span>Jonas &amp; Miso <small>· tabby cat, 7</small></span>
            </figcaption>
          </Reveal>
          <Reveal as="figure" delay={240}>
            <blockquote>“Every visit feels unhurried. They answer questions before we even ask them.”</blockquote>
            <figcaption>
              <span className="testimonial-avatar" aria-hidden="true">🐰</span>
              <span>Priya &amp; Clover <small>· holland lop rabbit, 2</small></span>
            </figcaption>
          </Reveal>
        </div>
      </section>

      <footer id="contact">
        <div>
          <a className="brand" href="#top"><span>✦</span> {content.brand}</a>
          <p>Better care. Brighter days.<br />For every beloved companion.</p>
        </div>
        <div>
          <strong>Ready to get started?</strong>
          <a className="primary-button" href="mailto:hello@pawcare.example">Book a visit <span>↗</span></a>
        </div>
      </footer>

      <a className={`to-top${ui.showTop ? ' visible' : ''}`} href="#top" aria-label="Back to top"><span>↑</span></a>
    </main>
  )
}

export default App
