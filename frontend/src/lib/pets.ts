import type { Pet } from './api'

export const SPECIES_LABEL: Record<Pet['species'], string> = {
  dog: 'Dog',
  cat: 'Cat',
  bird: 'Bird',
  rabbit: 'Rabbit',
  reptile: 'Reptile',
  other: 'Other',
}

export const SPECIES_EMOJI: Record<Pet['species'], string> = {
  dog: '🐕',
  cat: '🐈',
  bird: '🐦',
  rabbit: '🐇',
  reptile: '🦎',
  other: '🐾',
}

/** Rough age from a YYYY-MM-DD birth date: "3 yrs", "8 mo", or "newborn". */
export function formatPetAge(dateOfBirth: string): string {
  const birth = new Date(dateOfBirth)
  if (Number.isNaN(birth.getTime())) return ''
  const now = new Date()
  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (now.getDate() < birth.getDate()) months -= 1
  if (months <= 0) return 'newborn'
  if (months < 24) return `${months} mo`
  const years = Math.floor(months / 12)
  return `${years} yr${years === 1 ? '' : 's'}`
}