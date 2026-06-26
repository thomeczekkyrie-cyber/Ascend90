import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Trash2 } from 'lucide-react'

// =================== WAKEUP ===================
export function Wakeup() {
  const { user, profile } = useAuth()
  const [wakeups, setWakeups] = useState(new Set())
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => { if (user) load() }, [user])

  async function load() {
    const { data } = await supabase.from('wakeups').select('date').eq('user_id', user.id)
    setWakeups(new Set(data?.map(w => w.date) || []))
  }

  async function toggle(ds) {
    if (wakeups.has(ds)) {
      await supabase.from('wakeups').delete().eq('user_id', user.id).eq('date', ds)
      setWakeups(s => { const n = new Set(s); n.delete(ds); return n })
    } else {
      await supabase.from('wakeups').upsert({ user_id: user.id, date: ds })
      setWakeups(s => new Set([...s, ds]))
    }
  }

  const startDate = profile?.start_date ? new Date(profile.start_date + 'T00:00:00') : new Date()

  let streak = 0
  const d = new Date()
  for (let i = 0; i < 90; i++) {
    const ds = new Date(d); ds.setDate(d.getDate() - i)
    if (wakeups.has(ds.toISOString().split('T')[0])) streak++
    else break
  }

  const total = wakeups.size
  const elapsed = profile?.start_date
    ? Math.min(90, Math.max(1, Math.floor((new Date() - new Date(profile.start_date)) / 86400000) + 1)) : 1

  return (
    <div>
      <div className="page-header"><h1>4am wake-up log</h1><p>Tap a day to mark it. Protect the streak.</p></div>
      <div className="stat-grid">
        <div className="stat-box stat-green"><div className="stat-label">Current streak</div><div className="stat-value">{streak}</div><div className="stat-sub">days in a row</div></div>
        <div className="stat-box stat-blue"><div className="stat-label">Total hits</div><div className="stat-value">{total}</div><div className="stat-sub">out of 90 days</div></div>
        <div className="stat-box stat-accent"><div className="stat-label">Success rate</div><div className="stat-value">{Math.round((total / elapsed) * 100)}%</div><div className="stat-sub">of days so far</div></div>
      </div>
      <div className="card">
        <p className="card-title">90-day calendar — tap to toggle</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(36px, 1fr))', gap: 5 }}>
          {Array.from({ length: 90 }, (_, i) => {
            const d2 = new Date(startDate); d2.setDate(startDate.getDate() + i)
            const ds = d2.toISOString().split('T')[0]
            const checked = wakeups.has(ds)
            const isToday = ds === today
            return (
              <div key={i} onClick={() => toggle(ds)} style={{
                aspectRatio: '1', borderRadius: 6,
                border: `1px solid ${isToday ? 'var(--accent)' : checked ? 'rgba(31,202,118,0.3)' : 'var(--border2)'}`,
                background: checked ? 'var(--green-soft)' : 'var(--surface2)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 10, color: checked ? 'var(--green)' : 'var(--text3)',
                fontWeight: checked ? 700 : 400, transition: 'all 0.12s', userSelect: 'none',
              }}>
                <span style={{ fontSize: 11, fontWeight: 600 }}>{i + 1}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// =================== WORKOUTS ===================
export function Workouts() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [type, setType] = useState('Strength training')
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (user) load() }, [user])

  async function load() {
    const { data } = await supabase.from('workouts').select('*').eq('user_id', user.id).order('date', { ascending: false })
    setWorkouts(data || [])
  }

  async function log() {
    if (!duration) return
    setLoading(true)
    try {
      await supabase.from('workouts').insert({ user_id: user.id, date, type, duration: parseInt(duration), notes })
      setDuration(''); setNotes('')
      await load()
    } finally { setLoading(false) }
  }

  async function del(id) {
    await supabase.from('workouts').delete().eq('id', id)
    setWorkouts(w => w.filter(x => x.id !== id))
  }

  const totalTime = workouts.reduce((a, w) => a + (w.duration || 0), 0)
  const avg = workouts.length ? Math.round(totalTime / workouts.length) : 0
  const now = new Date()
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay())
  const weekStr = weekStart.toISOString().split('T')[0]
  const weekCount = workouts.filter(w => w.date >= weekStr).length

  const typeColor = { 'Strength training': 'badge-blue', 'Cardio': 'badge-green', 'HIIT': 'badge-red', 'Walking': 'badge-accent', 'Running': 'badge-amber', 'Yoga / stretching': 'badge-pink', default: 'badge-accent' }

  function fmtDate(ds) { return new Date(ds + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }

  return (
    <div>
      <div className="page-header"><h1>Workout tracker</h1><p>Every session counts. Log it.</p></div>
      <div className="stat-grid">
        <div className="stat-box stat-blue"><div className="stat-label">Total sessions</div><div className="stat-value">{workouts.length}</div><div className="stat-sub">workouts logged</div></div>
        <div className="stat-box stat-green"><div className="stat-label">Total time</div><div className="stat-value">{totalTime}</div><div className="stat-sub">minutes</div></div>
        <div className="stat-box stat-amber"><div className="stat-label">This week</div><div className="stat-value">{weekCount}</div><div className="stat-sub">sessions</div></div>
        <div className="stat-box stat-accent"><div className="stat-label">Avg duration</div><div className="stat-value">{avg}</div><div className="stat-sub">min / session</div></div>
      </div>
      <div className="card">
        <p className="card-title">Log workout</p>
        <div className="form-row cols-2">
          <div><label className="form-label">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
          <div><label className="form-label">Duration (minutes)</label><input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 45" min="1" max="300" /></div>
        </div>
        <div className="form-row">
          <div><label className="form-label">Type</label>
            <select value={type} onChange={e => setType(e.target.value)}>
              {['Strength training','Cardio','HIIT','Walking','Running','Cycling','Yoga / stretching','Swimming','Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row"><div><label className="form-label">Notes (optional)</label><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="How it felt, PRs hit, what you worked..." /></div></div>
        <button className="btn" onClick={log} disabled={loading}>{loading ? 'Saving...' : 'Log workout'}</button>
      </div>
      <div className="card">
        <p className="card-title">History</p>
        {!workouts.length ? <p className="empty">No workouts yet. Log your first one above.</p> : (
          <div className="log-list">
            {workouts.map(w => (
              <div key={w.id} className="log-item">
                <span className="log-date">{fmtDate(w.date)}</span>
                <div className="log-main">
                  <div style={{ fontWeight: 600 }}>{w.type}</div>
                  {w.notes && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{w.notes}</div>}
                </div>
                <span className={`badge ${typeColor[w.type] || typeColor.default}`}>{w.duration} min</span>
                <button className="btn-danger" onClick={() => del(w.id)}><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// =================== HABITS ===================
export function Habits() {
  const { user, isPro } = useAuth()
  const [habits, setHabits] = useState([])
  const [logs, setLogs] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCat, setNewCat] = useState('health')
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => { if (user) load() }, [user])

  async function load() {
    const { data: h } = await supabase.from('habits').select('*').eq('user_id', user.id).order('created_at')
    const { data: l } = await supabase.from('habit_logs').select('*').eq('user_id', user.id).gte('date', (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0] })())
    setHabits(h || [])
    setLogs(l || [])
  }

  async function toggleHabit(habitId) {
    const done = logs.find(l => l.habit_id === habitId && l.date === today)
    if (done) {
      await supabase.from('habit_logs').delete().eq('id', done.id)
      setLogs(ls => ls.filter(l => l.id !== done.id))
    } else {
      const { data } = await supabase.from('habit_logs').insert({ user_id: user.id, habit_id: habitId, date: today }).select().single()
      if (data) setLogs(ls => [...ls, data])
    }
  }

  async function addHabit() {
    if (!newName.trim()) return
    if (!isPro && habits.length >= 3) return
    const { data } = await supabase.from('habits').insert({ user_id: user.id, name: newName.trim(), cat: newCat }).select().single()
    if (data) setHabits(h => [...h, data])
    setNewName(''); setShowForm(false)
  }

  async function deleteHabit(id) {
    await supabase.from('habits').delete().eq('id', id)
    setHabits(h => h.filter(x => x.id !== id))
  }

  function streakFor(habitId) {
    let s = 0
    const d = new Date()
    for (let i = 0; i < 90; i++) {
      const ds = new Date(d); ds.setDate(d.getDate() - i)
      const key = ds.toISOString().split('T')[0]
      if (logs.find(l => l.habit_id === habitId && l.date === key)) s++
      else break
    }
    return s
  }

  function last7(habitId) {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i))
      const ds = d.toISOString().split('T')[0]
      return logs.some(l => l.habit_id === habitId && l.date === ds)
    })
  }

  const catColor = { health: '#f05252', fitness: '#4a9eff', mindset: '#7c5cfc', business: '#1fca76', personal: '#f5a623' }
  const todayDone = habits.filter(h => logs.find(l => l.habit_id === h.id && l.date === today)).length

  return (
    <div>
      <div className="page-header"><h1>Daily habits</h1><p>Check off daily. Watch the streaks grow.</p></div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>
          Today: <strong style={{ color: todayDone === habits.length && habits.length > 0 ? 'var(--green)' : 'var(--text)' }}>{todayDone}/{habits.length} complete</strong>
        </div>
        <button className="btn-ghost" onClick={() => setShowForm(!showForm)}>+ Add habit</button>
      </div>

      {!isPro && habits.length >= 3 && (
        <div style={{ background: 'var(--amber-soft)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: 'var(--amber)' }}>
          Free plan: 3 habits max. <a href="/upgrade" style={{ color: 'var(--amber)', fontWeight: 700 }}>Upgrade to Pro</a> for unlimited.
        </div>
      )}

      {showForm && (
        <div className="card">
          <p className="card-title">New habit</p>
          <div className="form-row cols-2">
            <div><label className="form-label">Habit name</label><input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Drink 64oz water" /></div>
            <div><label className="form-label">Category</label>
              <select value={newCat} onChange={e => setNewCat(e.target.value)}>
                {['health','fitness','mindset','business','personal'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={addHabit}>Add habit</button>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card">
        {!habits.length ? <p className="empty">No habits yet. Add your first one above.</p> : habits.map(h => {
          const checked = !!logs.find(l => l.habit_id === h.id && l.date === today)
          const streak = streakFor(h.id)
          const week = last7(h.id)
          const color = catColor[h.cat] || '#888'
          return (
            <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
              <div onClick={() => toggleHabit(h.id)} style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0, cursor: 'pointer',
                border: `2px solid ${checked ? 'var(--green)' : 'var(--border2)'}`,
                background: checked ? 'var(--green)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
                {checked && <span style={{ color: '#000', fontSize: 13, fontWeight: 700 }}>✓</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, textDecoration: checked ? 'line-through' : 'none', color: checked ? 'var(--text3)' : 'var(--text)' }}>{h.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: color + '22', color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h.cat}</span>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {week.map((done, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: done ? 'var(--green)' : 'var(--surface3)' }} />)}
                  </div>
                </div>
              </div>
              {streak > 0 && <span style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 600 }}>🔥{streak}</span>}
              <button className="btn-danger" onClick={() => deleteHabit(h.id)}><Trash2 size={12} /></button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// =================== GOALS ===================
export function Goals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [cat, setCat] = useState('fitness')
  const [status, setStatus] = useState('not-started')
  const [notes, setNotes] = useState('')

  useEffect(() => { if (user) load() }, [user])
  async function load() {
    const { data } = await supabase.from('goals').select('*').eq('user_id', user.id).order('created_at')
    setGoals(data || [])
  }
  async function add() {
    if (!title.trim()) return
    const { data } = await supabase.from('goals').insert({ user_id: user.id, title, cat, status, notes }).select().single()
    if (data) setGoals(g => [...g, data])
    setTitle(''); setNotes(''); setShowForm(false)
  }
  async function cycle(id) {
    const g = goals.find(x => x.id === id)
    const next = { 'not-started': 'in-progress', 'in-progress': 'done', 'done': 'not-started' }[g.status]
    await supabase.from('goals').update({ status: next }).eq('id', id)
    setGoals(gs => gs.map(x => x.id === id ? { ...x, status: next } : x))
  }
  async function del(id) {
    await supabase.from('goals').delete().eq('id', id)
    setGoals(gs => gs.filter(x => x.id !== id))
  }

  const catColor = { fitness: '#4a9eff', health: '#1fca76', business: '#7c5cfc', financial: '#f5a623', personal: '#e879a0', mindset: '#a78bfa' }
  const statusInfo = { 'not-started': { label: 'Not started', cls: '' }, 'in-progress': { label: 'In progress', cls: 'badge-amber' }, 'done': { label: 'Done ✓', cls: 'badge-green' } }

  return (
    <div>
      <div className="page-header"><h1>90-day goals</h1><p>Write it down. Make it real.</p></div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button className="btn-ghost" onClick={() => setShowForm(!showForm)}>+ Add goal</button>
      </div>
      {showForm && (
        <div className="card">
          <p className="card-title">New goal</p>
          <div className="form-row"><div><label className="form-label">Goal title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Lose 20 lbs" /></div></div>
          <div className="form-row cols-2">
            <div><label className="form-label">Category</label><select value={cat} onChange={e => setCat(e.target.value)}>{['fitness','health','business','financial','personal','mindset'].map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label className="form-label">Status</label><select value={status} onChange={e => setStatus(e.target.value)}><option value="not-started">Not started</option><option value="in-progress">In progress</option><option value="done">Done</option></select></div>
          </div>
          <div className="form-row"><div><label className="form-label">Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Why this matters. What winning looks like." /></div></div>
          <div style={{ display: 'flex', gap: 8 }}><button className="btn" onClick={add}>Save goal</button><button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      {!goals.length ? <p className="empty" style={{ marginTop: 40 }}>No goals yet. What are you building in 90 days?</p> : goals.map(g => {
        const color = catColor[g.cat] || '#888'
        const si = statusInfo[g.status]
        return (
          <div key={g.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 5, background: color + '22', color, textTransform: 'uppercase', letterSpacing: '0.6px', flexShrink: 0, marginTop: 2 }}>{g.cat}</span>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>{g.title}</span>
              <button className="btn-danger" onClick={() => del(g.id)}><Trash2 size={12} /></button>
            </div>
            {g.notes && <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 10 }}>{g.notes}</p>}
            <button onClick={() => cycle(g.id)} className={`badge ${si.cls}`} style={{ cursor: 'pointer', border: 'none', fontSize: 12 }}>{si.label}</button>
          </div>
        )
      })}
    </div>
  )
}

// =================== TASKS ===================
export function Tasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [text, setText] = useState('')
  const [cat, setCat] = useState('stark')
  const [priority, setPriority] = useState('high')

  useEffect(() => { if (user) load() }, [user])
  async function load() {
    const { data } = await supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setTasks(data || [])
  }
  async function add() {
    if (!text.trim()) return
    const { data } = await supabase.from('tasks').insert({ user_id: user.id, text, cat, priority, done: false }).select().single()
    if (data) setTasks(t => [data, ...t])
    setText('')
  }
  async function toggle(id) {
    const t = tasks.find(x => x.id === id)
    await supabase.from('tasks').update({ done: !t.done }).eq('id', id)
    setTasks(ts => ts.map(x => x.id === id ? { ...x, done: !x.done } : x))
  }
  async function del(id) {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(ts => ts.filter(x => x.id !== id))
  }

  const catMeta = { stark: { label: 'Stark Ascent', color: '#7c5cfc' }, rainbow: { label: "Rainbow's Edge", color: '#e879a0' }, work: { label: 'CC Work', color: '#4a9eff' }, school: { label: 'School', color: '#f5a623' }, personal: { label: 'Personal', color: '#9896ac' }, health: { label: 'Health', color: '#1fca76' } }
  const priColor = { high: 'badge-red', medium: 'badge-amber', low: 'badge-accent' }

  const active = tasks.filter(t => !t.done)
  const done = tasks.filter(t => t.done)

  const renderTask = t => {
    const m = catMeta[t.cat] || { label: t.cat, color: '#888' }
    return (
      <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
        <div onClick={() => toggle(t.id)} style={{
          width: 19, height: 19, borderRadius: 5, flexShrink: 0, cursor: 'pointer', marginTop: 2,
          border: `1.5px solid ${t.done ? 'var(--accent)' : 'var(--border2)'}`,
          background: t.done ? 'var(--accent)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
        }}>
          {t.done && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? 'var(--text3)' : 'var(--text)' }}>{t.text}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: m.color + '20', color: m.color }}>{m.label}</span>
            <span className={`badge ${priColor[t.priority]}`} style={{ fontSize: 10 }}>{t.priority}</span>
          </div>
        </div>
        <button className="btn-danger" onClick={() => del(t.id)}><Trash2 size={12} /></button>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header"><h1>Task tracker</h1><p>Stark Ascent, Rainbow's Edge — what's moving today?</p></div>
      <div className="card">
        <p className="card-title">Add task</p>
        <div className="form-row"><div><label className="form-label">Task</label><input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="e.g. Send 5 outreach emails for Stark Ascent" onKeyDown={e => e.key === 'Enter' && add()} /></div></div>
        <div className="form-row cols-2">
          <div><label className="form-label">Category</label><select value={cat} onChange={e => setCat(e.target.value)}>{Object.entries(catMeta).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}</select></div>
          <div><label className="form-label">Priority</label><select value={priority} onChange={e => setPriority(e.target.value)}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
        </div>
        <button className="btn" onClick={add}>Add task</button>
      </div>
      <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Active ({active.length})</div>
      <div className="card" style={{ padding: '8px 16px', marginBottom: 14 }}>
        {active.length ? active.map(renderTask) : <p className="empty">No active tasks. Add one above.</p>}
      </div>
      <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Completed ({done.length})</div>
      <div className="card" style={{ padding: '8px 16px' }}>
        {done.length ? done.map(renderTask) : <p className="empty">Nothing completed yet.</p>}
      </div>
    </div>
  )
}

// =================== JOURNAL ===================
export function Journal() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [text, setText] = useState('')
  const [win, setWin] = useState('')
  const [energy, setEnergy] = useState(null)
  const [mood, setMood] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (user) load() }, [user])
  async function load() {
    const { data } = await supabase.from('journal').select('*').eq('user_id', user.id).order('date', { ascending: false })
    setEntries(data || [])
  }
  async function save() {
    if (!text.trim() && !win.trim()) return
    setLoading(true)
    try {
      await supabase.from('journal').upsert({ user_id: user.id, date, text, win, energy, mood }, { onConflict: 'user_id,date' })
      setText(''); setWin(''); setEnergy(null); setMood(null)
      await load()
    } finally { setLoading(false) }
  }
  async function del(id) {
    await supabase.from('journal').delete().eq('id', id)
    setEntries(e => e.filter(x => x.id !== id))
  }

  function fmtDate(ds) { return new Date(ds + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) }

  const MoodBtn = ({ label, val, type, current, set }) => (
    <button onClick={() => set(current === val ? null : val)} style={{
      background: current === val ? 'var(--amber-soft)' : 'var(--surface2)',
      border: `1px solid ${current === val ? 'rgba(245,166,35,0.3)' : 'var(--border2)'}`,
      borderRadius: 8, color: current === val ? 'var(--amber)' : 'var(--text2)',
      fontSize: 12, padding: '6px 11px', cursor: 'pointer', transition: 'all 0.15s',
    }}>{label}</button>
  )

  return (
    <div>
      <div className="page-header"><h1>Daily journal</h1><p>Small reflections compound into clarity.</p></div>
      <div className="card">
        <p className="card-title">Today's entry</p>
        <div className="form-row"><div><label className="form-label">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div></div>
        <div style={{ marginBottom: 12 }}>
          <label className="form-label">Energy</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[1,2,3,4,5].map(v => <MoodBtn key={v} label={['1 — Drained','2 — Low','3 — Okay','4 — Good','5 — Fired up'][v-1]} val={v} current={energy} set={setEnergy} />)}
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label className="form-label">Mood</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[1,2,3,4,5].map(v => <MoodBtn key={v} label={['1 — Rough','2 — Meh','3 — Stable','4 — Positive','5 — Great'][v-1]} val={v} current={mood} set={setMood} />)}
          </div>
        </div>
        <div className="form-row"><div><label className="form-label">Reflection</label><textarea value={text} onChange={e => setText(e.target.value)} rows={4} placeholder="What happened today? What are you thinking about?" /></div></div>
        <div className="form-row"><div><label className="form-label">Win of the day 🏆</label><input type="text" value={win} onChange={e => setWin(e.target.value)} placeholder="Something you're proud of, however small." /></div></div>
        <button className="btn" onClick={save} disabled={loading}>{loading ? 'Saving...' : 'Save entry'}</button>
      </div>
      <div className="card">
        <p className="card-title">Past entries</p>
        {!entries.length ? <p className="empty">No entries yet.</p> : entries.map(e => (
          <div key={e.id} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>{fmtDate(e.date)}</span>
              <button className="btn-danger" onClick={() => del(e.id)}><Trash2 size={12} /></button>
            </div>
            {(e.energy || e.mood) && (
              <div style={{ display: 'flex', gap: 16, marginBottom: 8, fontSize: 12, color: 'var(--text3)' }}>
                {e.energy && <span>Energy: <span style={{ color: 'var(--amber)' }}>{'●'.repeat(e.energy)}{'○'.repeat(5 - e.energy)}</span></span>}
                {e.mood && <span>Mood: <span style={{ color: 'var(--blue)' }}>{'●'.repeat(e.mood)}{'○'.repeat(5 - e.mood)}</span></span>}
              </div>
            )}
            {e.text && <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.65, marginBottom: e.win ? 8 : 0 }}>{e.text}</p>}
            {e.win && <p style={{ fontSize: 13, color: 'var(--green)', fontWeight: 500 }}>🏆 {e.win}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
