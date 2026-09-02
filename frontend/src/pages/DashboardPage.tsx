import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth-context'
import { fetchPets } from '../lib/api'
import type { Pet } from '../lib/api'
import './DashboardPage.css'

const SPECIES_LABEL: Record<Pet['species'], string> = {
  dog: 'Dog',
  cat: 'Cat',
  bird: 'Bird',
  rabbit: 'Rabbit',
  reptile: 'Reptile',
  other: 'Other',
}

const SPECIES_EMOJI: Record<Pet['species'], string> = {
  dog: '🐕',
  cat: '🐈',
  bird: '🐦',
  rabbit: '🐇',
  reptile: '🦎',
  other: '🐾',
}

const iconProps = {
  viewBox: '0 0 24 24',
  width: 16,
  height: 16,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

const ICONS = {
  home: (
    <svg {...iconProps}><path d="M3 9.5 12 3l9 6.5V20a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20V9.5Z" /><path d="M9 21.5v-7h6v7" /></svg>
  ),
  profile: (
    <svg {...iconProps}><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" /></svg>
  ),
  pets: (
    <svg {...iconProps}>
      <circle cx="5.5" cy="8" r="2" />
      <circle cx="10" cy="4.5" r="2" />
      <circle cx="15" cy="4.5" r="2" />
      <circle cx="19.5" cy="8" r="2" />
      <path d="M5 11c-2.2 0-3.5 1.7-3 3.6.4 1.7 1.6 2.9 3.6 3.5 2.4.7 5-.4 6.4-.4s4 1.1 6.4.4c2-.6 3.2-1.8 3.6-3.5.5-1.9-.8-3.6-3-3.6-1.8 0-2.7 1.3-4 1.3s-2.2-1.3-4-1.3-2.2 1.3-4 1.3Z" />
    </svg>
  ),
  appointments: (
    <svg {...iconProps}><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 9.5h17" /><path d="M8 2.5v4.5" /><path d="M16 2.5v4.5" /></svg>
  ),
  settings: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  ),
  logout: (
    <svg {...iconProps}><path d="M15 4.5H6.5A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5H15" /><path d="M10 12h10" /><path d="m16.5 8.5 3.5 3.5-3.5 3.5" /></svg>
  ),
} as const

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

function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // On desktop the sidebar is always visible; the hamburger drawer is for smaller screens.
  const isDesktop = useSyncExternalStore(subscribeToDesktop, getDesktopSnapshot, () => false)

  const [pets, setPets] = useState<Pet[] | null>(null)
  const [petsError, setPetsError] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const sidebarOpen = isDesktop || menuOpen

  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    fetchPets(user.id)
      .then(({ data }) => {
        if (!cancelled) setPets(data)
      })
      .catch(() => {
        if (!cancelled) setPetsError(true)
      })
    return () => {
      cancelled = true
    }
  }, [user])

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
  const memberSinceShort = new Date(user.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
  })
  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1)
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

      <main className="dashboard-main">
        <section className="dashboard-hero">
          <div className="dashboard-avatar" aria-hidden="true">{initials}</div>
          <div>
            <p className="eyebrow">Your account</p>
            <h1>Welcome back, {user.first_name} <span className="wave" aria-hidden="true">👋</span></h1>
            <p className="dashboard-sub">{user.email}</p>
          </div>
        </section>

        <div className="stat-strip">
          <div className="stat-tile">
            <span className="stat-icon" aria-hidden="true">{ICONS.pets}</span>
            <div>
              <strong>{pets === null ? '…' : pets.length}</strong>
              <small>Pets</small>
            </div>
          </div>
          <div className="stat-tile">
            <span className="stat-icon" aria-hidden="true">{ICONS.appointments}</span>
            <div>
              <strong>{memberSinceShort}</strong>
              <small>Member since</small>
            </div>
          </div>
          <div className="stat-tile">
            <span className="stat-icon" aria-hidden="true">{ICONS.profile}</span>
            <div>
              <strong>{roleLabel}</strong>
              <small>Role</small>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <section className="dashboard-card">
            <h2>Profile</h2>
            <dl className="profile-list">
              <div>
                <dt>Full name</dt>
                <dd>{fullName}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{user.phone ?? 'Not provided'}</dd>
              </div>
              <div>
                <dt>Member ID</dt>
                <dd>#{user.id}</dd>
              </div>
            </dl>
          </section>

          <section className="dashboard-card">
            <div className="pets-head">
              <h2>My pets</h2>
              {pets !== null && <span className="pets-count">{pets.length}</span>}
            </div>

            {petsError ? (
              <p className="pets-empty">Couldn&apos;t load your pets. Please try again later.</p>
            ) : pets === null ? (
              <p className="pets-empty">Loading your pets…</p>
            ) : pets.length === 0 ? (
              <p className="pets-empty">No pets yet — add your first companion to get started.</p>
            ) : (
              <ul className="pets-list">
                {pets.map((pet) => (
                  <li key={pet.id}>
                    <span className="pet-avatar" aria-hidden="true">{SPECIES_EMOJI[pet.species]}</span>
                    <div className="pet-info">
                      <strong>{pet.name}</strong>
                      <span>
                        {SPECIES_LABEL[pet.species]}
                        {pet.breed ? ` · ${pet.breed}` : ''}
                      </span>
                    </div>
                    {pet.weight_kg && <span className="pet-weight">{Number(pet.weight_kg)} kg</span>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage