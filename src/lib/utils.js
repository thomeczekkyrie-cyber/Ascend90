export const today = () => new Date().toISOString().split('T')[0]

export const fmtDate = (ds) => {
  if (!ds) return ''
  const d = new Date(ds + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const fmtDateShort = (ds) => {
  if (!ds) return ''
  const d = new Date(ds + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export const currentDay = (startDate) => {
  if (!startDate) return 1
  const start = new Date(startDate + 'T00:00:00')
  const now = new Date()
  return Math.min(90, Math.max(1, Math.floor((now - start) / 86400000) + 1))
}

export const calcStreak = (checkedMap) => {
  let streak = 0
  const d = new Date()
  for (let i = 0; i < 90; i++) {
    const ds = new Date(d)
    ds.setDate(d.getDate() - i)
    const key = ds.toISOString().split('T')[0]
    if (checkedMap[key]) streak++
    else break
  }
  return streak
}

export const calcHabitStreak = (habitId, habitLog) => {
  let streak = 0
  const d = new Date()
  for (let i = 0; i < 90; i++) {
    const ds = new Date(d)
    ds.setDate(d.getDate() - i)
    const key = ds.toISOString().split('T')[0]
    if ((habitLog[key] || []).includes(habitId)) streak++
    else break
  }
  return streak
}

export const getLast7Days = () => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

export const PLAN_LIMITS = {
  free: { habits: 3, goals: 3, tasks: 10, journal: false, workouts: true, weight: true, wakeup: true },
  premium: { habits: Infinity, goals: Infinity, tasks: Infinity, journal: true, workouts: true, weight: true, wakeup: true }
}

export const CAT_COLORS = {
  health:   { bg: 'rgba(240,90,90,0.15)',    text: '#f05a5a' },
  fitness:  { bg: 'rgba(74,158,255,0.15)',   text: '#4a9eff' },
  mindset:  { bg: 'rgba(124,92,252,0.15)',   text: '#7c5cfc' },
  business: { bg: 'rgba(34,201,122,0.15)',   text: '#22c97a' },
  financial:{ bg: 'rgba(245,166,35,0.15)',   text: '#f5a623' },
  personal: { bg: 'rgba(240,98,146,0.15)',   text: '#f06292' },
  stark:    { bg: 'rgba(124,92,252,0.15)',   text: '#7c5cfc' },
  rainbow:  { bg: 'rgba(240,98,146,0.15)',   text: '#f06292' },
  work:     { bg: 'rgba(74,158,255,0.15)',   text: '#4a9eff' },
  school:   { bg: 'rgba(245,166,35,0.15)',   text: '#f5a623' },
}
