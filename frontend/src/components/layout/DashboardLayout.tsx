import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import { Footer } from './Footer'
import { ICONS } from './icons'
import './DashboardLayout.css'

const DESKTOP_QUERY = '(min-width: 900px)'

function subscribeToDesktop(onChange: () => void) {
  const mql = window.matchMedia(DESKTOP_QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

function getDesktopSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches
}

const SIDEBAR_LINKS = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/profile', label: 'Profile', icon: 'profile' },
  { to: '/pets', label: 'My pets', icon: 'pets' },
  { to: '/appointments', label: 'Appointments', icon: 'appointments' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
] as const

interface DashboardLayoutProps {
  children: ReactNode
}

/**
 * Shared shell for signed-in pages: auth gate, topbar with hamburger,
 * sidebar (drawer on mobile, persistent on desktop) and the site footer.
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // On desktop the sidebar is always visible; the hamburger drawer is for smaller screens.
  const isDesktop = useSyncExternalStore(subscribeToDesktop, getDesktopSnapshot, () => false)
  const [menuOpen, setMenuOpen] = useState(false)
  const sidebarOpen = isDesktop || menuOpen

  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)

  // Close on Escape and move focus back to the hamburger
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        hamburgerRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  // Lock body scroll while the sidebar is open
  useEffect(() => {
    if (!menuOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  // Move focus into the sidebar when it opens
  useEffect(() => {
    if (menuOpen) firstLinkRef.current?.focus()
  }, [menuOpen])

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

  async function handleLogout() {
    setMenuOpen(false)
    await logout()
    navigate('/', { replace: true })
  }

  const fullName = `${user.first_name} ${user.last_name}`
  const initials = `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase() || 'PC'
  const isActive = (path: string) => location.pathname === path

  return (
    <div className="dashboard-page">
      <header className="dashboard-topbar">
        <Link className="brand" to="/"><span>✦</span> PawCare</Link>
        <button
          ref={hamburgerRef}
          className={`hamburger${menuOpen ? ' is-open' : ''}`}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="dashboard-sidebar"
        >
          <span /><span /><span />
        </button>
      </header>

      <div
        className={`sidebar-overlay${menuOpen ? ' is-open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <aside
        id="dashboard-sidebar"
        className={`dashboard-sidebar${sidebarOpen ? ' is-open' : ''}`}
        aria-label="Account menu"
        aria-hidden={!sidebarOpen}
        inert={!sidebarOpen}
      >
        <div className="sidebar-head">
          <Link className="sidebar-brand" to="/" onClick={() => setMenuOpen(false)}>
            <span aria-hidden="true">✦</span> PawCare
          </Link>
          <button
            className="sidebar-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className="sidebar-user">
          <span className="sidebar-user-avatar" aria-hidden="true">{initials}</span>
          <div className="sidebar-user-info">
            <strong>{fullName}</strong>
            <span>{user.email}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {SIDEBAR_LINKS.map((link, index) => (
            <Link
              key={link.to}
              ref={index === 0 ? firstLinkRef : undefined}
              to={link.to}
              className={isActive(link.to) ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {ICONS[link.icon]}
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={() => void handleLogout()}>
            {ICONS.logout}
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">{children}</main>

      <Footer />
    </div>
  )
}