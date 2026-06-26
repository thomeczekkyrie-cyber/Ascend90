export const THEMES = [
  { id: 'crimson', label: 'Crimson', accent: '#e03d3d', accent2: '#b82e2e', soft: 'rgba(224,61,61,0.15)' },
  { id: 'ocean', label: 'Ocean', accent: '#4a9eff', accent2: '#2d7dd6', soft: 'rgba(74,158,255,0.15)' },
  { id: 'forest', label: 'Forest', accent: '#22c97a', accent2: '#18a863', soft: 'rgba(34,201,122,0.15)' },
  { id: 'violet', label: 'Violet', accent: '#7c5cfc', accent2: '#5e3edc', soft: 'rgba(124,92,252,0.15)' },
  { id: 'sunset', label: 'Sunset', accent: '#f5a623', accent2: '#d4890f', soft: 'rgba(245,166,35,0.15)' },
  { id: 'rose', label: 'Rose', accent: '#f06292', accent2: '#d44d78', soft: 'rgba(240,98,146,0.15)' },
  { id: 'slate', label: 'Slate', accent: '#94a3b8', accent2: '#748096', soft: 'rgba(148,163,184,0.15)' },
  { id: 'gold', label: 'Gold', accent: '#fbbf24', accent2: '#d4a017', soft: 'rgba(251,191,36,0.15)' },
]

export function applyTheme(themeId) {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0]
  document.documentElement.style.setProperty('--theme-accent', theme.accent)
  document.documentElement.style.setProperty('--theme-accent2', theme.accent2)
  document.documentElement.style.setProperty('--theme-accent-soft', theme.soft)
}

export function loadTheme() {
  const saved = localStorage.getItem('ascend90_theme') || 'crimson'
  applyTheme(saved)
  return saved
}

export function saveTheme(themeId) {
  localStorage.setItem('ascend90_theme', themeId)
  applyTheme(themeId)
}
