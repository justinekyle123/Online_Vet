import { Link } from 'react-router-dom'
import './Footer.css'

const EXPLORE_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/login', label: 'Log in' },
  { to: '/register', label: 'Sign up' },
] as const

/** Reusable footer for dashboard pages — brand, quick links, and copyright. */
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <Link className="brand" to="/"><span>✦</span> PawCare</Link>
          <p>Better care. Brighter days.<br />For every beloved companion.</p>
        </div>

        <nav className="site-footer-nav" aria-label="Footer">
          <strong>Explore</strong>
          {EXPLORE_LINKS.map((link) => (
            <Link key={link.to} to={link.to}>{link.label}</Link>
          ))}
        </nav>

        <p className="site-footer-copy">© {year} PawCare. All rights reserved.</p>
      </div>
    </footer>
  )
}