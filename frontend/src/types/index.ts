export interface LandingStat {
  value: string
  label: string
}

/** Shape returned by `GET /api/landing`. */
export interface LandingContent {
  brand: string
  eyebrow: string
  title: string
  description: string
  primaryCta: string
  secondaryCta: string
  stats: LandingStat[]
}

export interface NavItem {
  id: string
  label: string
}

export interface UiState {
  scrolled: boolean
  progress: number
  showTop: boolean
  active: string
}
