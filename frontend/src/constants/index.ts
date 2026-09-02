import type { LandingContent, NavItem } from '../types'

/** Used when the API is unreachable so the page still renders. */
export const FALLBACK_CONTENT: LandingContent = {
  brand: 'PawCare',
  eyebrow: 'Trusted care for every companion',
  title: 'A healthier, happier life for every companion.',
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

export const MARQUEE_ITEMS = [
  'Preventive care',
  'Vaccinations',
  'Dental hygiene',
  'Urgent support',
  'Grooming',
  'Nutrition plans',
  'Surgery',
  'Fear-free visits',
]

export const NAV_ITEMS: NavItem[] = [
  { id: 'services', label: 'Services' },
  { id: 'about', label: 'About us' },
  { id: 'testimonials', label: 'Stories' },
  { id: 'contact', label: 'Contact' },
]

/** Height of the sticky navbar, used as the anchor-scroll offset. */
export const NAV_OFFSET = 92
