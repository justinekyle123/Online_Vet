import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { ICONS } from '../components/layout/icons'
import { useAuth } from '../context/auth-context'
import { createPet, deletePet, fetchPets } from '../lib/api'
import type { Pet, PetInput } from '../lib/api'
import { SPECIES_EMOJI, SPECIES_LABEL, formatPetAge } from '../lib/pets'
import './MyPetsPage.css'

const SPECIES_OPTIONS = (Object.keys(SPECIES_LABEL) as Pet['species'][]).map((species) => ({
  value: species,
  label: SPECIES_LABEL[species],
}))

const SEX_OPTIONS: { value: Pet['sex']; label: string }[] = [
  { value: 'unknown', label: 'Unknown' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
]

function MyPetsPage() {
  const { user } = useAuth()
  const [pets, setPets] = useState<Pet[] | null>(null)
  const [loadError, setLoadError] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [species, setSpecies] = useState<Pet['species']>('dog')
  const [breed, setBreed] = useState('')
  const [sex, setSex] = useState<Pet['sex']>('unknown')
  const [dob, setDob] = useState('')
  const [weight, setWeight] = useState('')

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const confirmTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    fetchPets(user.id)
      .then(({ data }) => {
        if (!cancelled) {
          setPets(data)
          setLoadError(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(
    () => () => {
      window.clearTimeout(confirmTimer.current)
    },
    [],
  )

  if (!user) return null
  const userId = user.id

  async function refreshPets() {
    try {
      const { data } = await fetchPets(userId)
      setPets(data)
      setLoadError(false)
    } catch {
      setLoadError(true)
    }
  }

  function resetForm() {
    setName('')
    setSpecies('dog')
    setBreed('')
    setSex('unknown')
    setDob('')
    setWeight('')
    setFormError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    if (!name.trim()) {
      setFormError('Please give your pet a name.')
      return
    }
    setSubmitting(true)
    try {
      const payload: PetInput = { name: name.trim(), species, sex }
      if (breed.trim()) payload.breed = breed.trim()
      if (dob) payload.date_of_birth = dob
      if (weight.trim()) payload.weight_kg = weight.trim()
      await createPet(userId, payload)
      await refreshPets()
      resetForm()
      setFormOpen(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleDelete(pet: Pet) {
    if (confirmDeleteId !== pet.id) {
      setConfirmDeleteId(pet.id)
      window.clearTimeout(confirmTimer.current)
      confirmTimer.current = window.setTimeout(() => setConfirmDeleteId(null), 3000)
      return
    }
    window.clearTimeout(confirmTimer.current)
    setConfirmDeleteId(null)
    deletePet(pet.id)
      .then(() => {
        setPets((prev) => prev?.filter((p) => p.id !== pet.id) ?? null)
      })
      .catch(() => {
        setLoadError(true)
      })
  }

  const petCount = pets === null ? undefined : pets.length

  return (
    <DashboardLayout>
      <section className="page-head">
        <p className="eyebrow">Your pets</p>
        <h1>My pets</h1>
        <p className="page-head-sub">
          Keep your companions&apos; profiles up to date — add a new pet, or remove one when needed.
        </p>
      </section>

      <div className="mypets-actions">
        <button
          className="mypets-add"
          onClick={() => setFormOpen((open) => !open)}
          aria-expanded={formOpen}
        >
          {ICONS.plus}
          <span>{formOpen ? 'Cancel' : 'Add pet'}</span>
        </button>
        {petCount !== undefined && <span className="pets-count">{petCount} {petCount === 1 ? 'pet' : 'pets'}</span>}
      </div>

      {formOpen && (
        <form className="dashboard-card mypets-form" onSubmit={handleSubmit} noValidate>
          <h2>Add a pet</h2>
          {formError && <div className="mypets-error" role="alert">{formError}</div>}

          <div className="mypets-form-grid">
            <div className="mypets-field">
              <label htmlFor="pet-name">Name <span aria-hidden="true">*</span></label>
              <input
                id="pet-name"
                type="text"
                placeholder="e.g. Luna"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="mypets-field">
              <label htmlFor="pet-species">Species</label>
              <select
                id="pet-species"
                value={species}
                onChange={(e) => setSpecies(e.target.value as Pet['species'])}
              >
                {SPECIES_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="mypets-field">
              <label htmlFor="pet-breed">Breed</label>
              <input
                id="pet-breed"
                type="text"
                placeholder="e.g. Golden Retriever"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
              />
            </div>
            <div className="mypets-field">
              <label htmlFor="pet-sex">Sex</label>
              <select
                id="pet-sex"
                value={sex}
                onChange={(e) => setSex(e.target.value as Pet['sex'])}
              >
                {SEX_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="mypets-field">
              <label htmlFor="pet-dob">Date of birth</label>
              <input
                id="pet-dob"
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
            <div className="mypets-field">
              <label htmlFor="pet-weight">Weight (kg)</label>
              <input
                id="pet-weight"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="e.g. 12.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
          </div>

          <button className="mypets-submit" type="submit" disabled={submitting}>
            {submitting ? 'Adding pet…' : 'Add pet'}
          </button>
        </form>
      )}

      {loadError ? (
        <div className="dashboard-card mypets-state">
          <p className="pets-empty">Couldn&apos;t load your pets. Please try again later.</p>
        </div>
      ) : pets === null ? (
        <div className="dashboard-card mypets-state">
          <p className="pets-empty">Loading your pets…</p>
        </div>
      ) : pets.length === 0 ? (
        <div className="dashboard-card mypets-state">
          <p className="pets-empty">
            No pets yet. Hit <strong>Add pet</strong> to register your first companion.
          </p>
        </div>
      ) : (
        <ul className="mypets-list">
          {pets.map((pet) => (
            <li key={pet.id} className={`dashboard-card mypets-item${confirmDeleteId === pet.id ? ' is-confirming' : ''}`}>
              <span className="mypets-avatar" aria-hidden="true">{SPECIES_EMOJI[pet.species]}</span>
              <div className="mypets-info">
                <strong>{pet.name}</strong>
                <span>
                  {SPECIES_LABEL[pet.species]}
                  {pet.breed ? ` · ${pet.breed}` : ''}
                </span>
              </div>
              <div className="mypets-meta">
                {pet.sex !== 'unknown' && pet.date_of_birth && <span>{SEX_OPTIONS.find((o) => o.value === pet.sex)?.label} · {formatPetAge(pet.date_of_birth)}</span>}
                {pet.sex === 'unknown' && pet.date_of_birth && <span>{formatPetAge(pet.date_of_birth)}</span>}
                {pet.sex !== 'unknown' && !pet.date_of_birth && <span>{SEX_OPTIONS.find((o) => o.value === pet.sex)?.label}</span>}
                {pet.weight_kg && <span>{Number(pet.weight_kg)} kg</span>}
              </div>
              <button
                className="mypets-delete"
                onClick={() => handleDelete(pet)}
                aria-label={confirmDeleteId === pet.id ? `Confirm deleting ${pet.name}` : `Delete ${pet.name}`}
              >
                {confirmDeleteId === pet.id ? (
                  <span>Confirm?</span>
                ) : (
                  ICONS.trash
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </DashboardLayout>
  )
}

export default MyPetsPage