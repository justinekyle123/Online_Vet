import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { ICONS } from '../components/layout/icons'
import { useAuth } from '../context/auth-context'
import { fetchPets } from '../lib/api'
import type { Pet } from '../lib/api'
import { SPECIES_EMOJI, SPECIES_LABEL } from '../lib/pets'
import './DashboardPage.css'

function DashboardPage() {
  const { user } = useAuth()
  const [pets, setPets] = useState<Pet[] | null>(null)
  const [petsError, setPetsError] = useState(false)

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

  if (!user) return null

  const fullName = `${user.first_name} ${user.last_name}`
  const initials = `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase() || 'PC'
  const memberSinceShort = new Date(user.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
  })
  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1)
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <DashboardLayout>
      <section className="dashboard-hero">
        <div className="dashboard-avatar" aria-hidden="true">{initials}</div>
        <div className="dashboard-hero-copy">
          <p className="eyebrow">Your account</p>
          <h1>Welcome back, {user.first_name} <span className="wave" aria-hidden="true">👋</span></h1>
          <p className="dashboard-sub">{user.email}</p>
        </div>
        <div className="dashboard-hero-side">
          <span className="dashboard-date">{today}</span>
          <Link className="hero-quicklink" to="/pets">{ICONS.plus} Add pet</Link>
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
            <div className="pets-head-actions">
              {pets !== null && <span className="pets-count">{pets.length}</span>}
              <Link className="pets-view-all" to="/pets">View all →</Link>
            </div>
          </div>

          {petsError ? (
            <p className="pets-empty">Couldn&apos;t load your pets. Please try again later.</p>
          ) : pets === null ? (
            <p className="pets-empty">Loading your pets…</p>
          ) : pets.length === 0 ? (
            <p className="pets-empty">
              No pets yet — <Link to="/pets">add your first companion</Link> to get started.
            </p>
          ) : (
            <ul className="pets-list">
              {pets.slice(0, 4).map((pet) => (
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
    </DashboardLayout>
  )
}

export default DashboardPage