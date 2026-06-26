import { useState, useEffect } from 'react'
import { getWorkouts, insertWorkout, deleteWorkout } from '../lib/db.js'
import { today, fmtDate } from '../lib/utils.js'

const TYPES = ['Strength training','Cardio','HIIT','Walking','Running','Cycling','Yoga / stretching','Swimming','Other']
const TYPE_BADGES = { 'Strength training':'badge-blue','Cardio':'badge-green','HIIT':'badge-red','Walking':'badge-accent','Running':'badge-amber','Yoga / stretching':'badge-pink','Cycling':'badge-blue','Swimming':'badge-blue','Other':'badge-accent' }

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([])
  const [date, setDate] = useState(today())
  const [dur, setDur] = useState('')
  const [type, setType] = useState('Strength training')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const w = await getWorkouts()
    setWorkouts(w); setLoading(false)
  }

  async function handleLog() {
    const d = parseInt(dur)
    if (!d || d < 1) return
    await insertWorkout({ date, dur: d, type, notes })
    setDur(''); setNotes('')
    setWorkouts(await getWorkouts())
  }

  async function handleDelete(id) {
    await deleteWorkout(id)
    setWorkouts(workouts.filter(w => w.id !== id))
  }

  const total = workouts.length
  const totalTime = workouts.reduce((a, w) => a + w.dur, 0)
  const avg = total ? Math.round(totalTime / total) : 0
  const now = new Date()
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay())
  const weekStartStr = weekStart.toISOString().split('T')[0]
  const weekCount = workouts.filter(w => w.date >= weekStartStr).length

  if (loading) return <div className="empty">Loading...</div>

  return (
    <div style={{ maxWidth:'800px' }}>
      <div className="page-header"><h1>Workout tracker</h1><p>Every session counts. Log it.</p></div>

      <div className="stat-grid">
        <div className="stat-box"><div className="stat-label">Total sessions</div><div className="stat-value sv-blue">{total}</div><div className="stat-sub">workouts logged</div></div>
        <div className="stat-box"><div className="stat-label">Total time</div><div className="stat-value sv-green">{totalTime}</div><div className="stat-sub">minutes</div></div>
        <div className="stat-box"><div className="stat-label">This week</div><div className="stat-value sv-amber">{weekCount}</div><div className="stat-sub">sessions</div></div>
        <div className="stat-box"><div className="stat-label">Avg duration</div><div className="stat-value sv-accent">{avg}</div><div className="stat-sub">min / session</div></div>
      </div>

      <div className="card">
        <p className="card-title">Log workout</p>
        <div className="form-grid-2 form-row">
          <div><label className="form-label">Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} /></div>
          <div><label className="form-label">Duration (minutes)</label><input type="number" placeholder="45" min="1" max="300" value={dur} onChange={e=>setDur(e.target.value)} /></div>
        </div>
        <div className="form-row"><label className="form-label">Type</label>
          <select value={type} onChange={e=>setType(e.target.value)}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-row"><label className="form-label">Notes (optional)</label>
          <textarea placeholder="How it felt, what you lifted, any PRs..." value={notes} onChange={e=>setNotes(e.target.value)} rows={3} />
        </div>
        <button className="btn" onClick={handleLog}>Log workout</button>
      </div>

      <div className="card">
        <p className="card-title">Log ({total} sessions)</p>
        {!workouts.length ? <p className="empty">No workouts logged yet.</p> : (
          <div className="log-list">
            {workouts.map(w => (
              <div key={w.id} className="log-item">
                <span className="log-date">{fmtDate(w.date)}</span>
                <div className="log-main">
                  <div style={{ fontWeight:600 }}>{w.type}</div>
                  {w.notes && <div style={{ fontSize:'12px', color:'var(--text2)', marginTop:'2px' }}>{w.notes}</div>}
                </div>
                <span className={`badge ${TYPE_BADGES[w.type]||'badge-accent'}`}>{w.dur} min</span>
                <button className="btn-danger" onClick={() => handleDelete(w.id)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
