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

export const ICONS = {
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
  plus: (
    <svg {...iconProps}><path d="M12 5v14" /><path d="M5 12h14" /></svg>
  ),
  trash: (
    <svg {...iconProps}><path d="M4 7h16" /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /><path d="M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-12" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
  ),
} as const