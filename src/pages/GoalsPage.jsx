import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext.jsx'
import { getGoals, insertGoal, updateGoalStatus, deleteGoal } from '../lib/db.js'
import { PLAN_LIMITS, CAT_COLORS } from '../lib/utils.js'
import { useNavigate } from 'react-router-dom'

const STATUS_CYCLE = ['not-started', 'in-progress', 'done']
const STATUS_STYLE = {
  'not-started': { bg:'var(--surface3)', color:'var(--text2)', label:'Not started' },
  'in-progress': { bg:'var(--amber-soft)', color:'var(--amber)', label:'In progress' },
  'done': { bg:'var(--green-soft)', color:'var(--green)', label:'Done ✓' }
}

export default function GoalsPage() {
  const { isPremium } = useAuth()
  const navigate = useNavigate()
  const [goals, setGoals] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [cat, setCat] = useState('fitness')
  const [status, setStatus] = useState('not-started')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)

  const limit = isPremium ? Infinity : PLAN_LIMITS.free.goals
  useEffect(() => { getGoals().then(g => { setGoals(g); setLoading(false) }) }, [])

  async function handleAdd() {
    if (!title.trim()) return
    if (goals.length >= limit) return
    await insertGoal({ title: title.trim(), cat, status, notes })
    setTitle(''); setNotes(''); setShowForm(false)
    setGoals(await getGoals())
  }

  async function handleStatus(id, current) {
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length]
    await updateGoalStatus(id, next)
    setGoals(goals.map(g => g.id === id ? { ...g, status: next } : g))
  }

  async function handleDelete(id) {
    await deleteGoal(id)
    setGoals(goals.filter(g => g.id !== id))
  }

  const done = goals.filter(g => g.status === 'done').length
  const inProgress = goals.filter(g => g.status === 'in-progress').length

  if (loading) return <div className="empty">Loading...</div>

  return (
    <div style={{ maxWidth:'800px' }}>
      <div className="page-header"><h1>90-day goals</h1><p>What are you building in 90 days? Make it real by writing it down.</p></div>

      <div className="stat-grid">
        <div className="stat-box"><div className="stat-label">Total goals</div><div className="stat-value sv-accent">{goals.length}</div><div className="stat-sub">{!isPremium ? `of ${limit} on free plan` : 'goals set'}</div></div>
        <div className="stat-box"><div className="stat-label">In progress</div><div className="stat-value sv-amber">{inProgress}</div><div className="stat-sub">active now</div></div>
        <div className="stat-box"><div className="stat-label">Completed</div><div className="stat-value sv-green">{done}</div><div className="stat-sub">goals crushed</div></div>
      </div>

      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'16px' }}>
        <button className="btn-ghost" onClick={() => { if (goals.length >= limit && !isPremium) navigate('/app/account'); else setShowForm(!showForm) }}>
          {goals.length >= limit && !isPremium ? '🔒 Upgrade for unlimited goals' : '+ Add goal'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <p className="card-title">New goal</p>
          <div className="form-row"><label className="form-label">Goal title</label><input type="text" placeholder="e.g. Lose 20 lbs by day 90" value={title} onChange={e=>setTitle(e.target.value)} /></div>
          <div className="form-grid-2 form-row">
            <div><label className="form-label">Category</label>
              <select value={cat} onChange={e=>setCat(e.target.value)}>
                {['fitness','health','business','financial','personal','mindset'].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="form-label">Status</label>
              <select value={status} onChange={e=>setStatus(e.target.value)}>
                {STATUS_CYCLE.map(s=><option key={s} value={s}>{STATUS_STYLE[s].label}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row"><label className="form-label">Notes</label><textarea placeholder="Why this matters. What it means to achieve it." value={notes} onChange={e=>setNotes(e.target.value)} /></div>
          <div style={{ display:'flex', gap:'8px' }}>
            <button className="btn" onClick={handleAdd}>Save goal</button>
            <button className="btn-ghost" onClick={()=>setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div>
        {!goals.length ? <p className="empty">No goals yet. What do you want to accomplish in 90 days?</p>
          : goals.map(g => {
            const c = CAT_COLORS[g.cat] || CAT_COLORS.personal
            const s = STATUS_STYLE[g.status]
            return (
              <div key={g.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'14px', padding:'18px', marginBottom:'10px' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:'10px', marginBottom: g.notes ? '10px' : '12px' }}>
                  <span style={{ fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'5px', background:c.bg, color:c.text, textTransform:'uppercase', letterSpacing:'0.5px', flexShrink:0, marginTop:'2px' }}>{g.cat}</span>
                  <span style={{ fontSize:'15px', fontWeight:600, flex:1 }}>{g.title}</span>
                  <button className="btn-danger" onClick={()=>handleDelete(g.id)}>✕</button>
                </div>
                {g.notes && <p style={{ fontSize:'13px', color:'var(--text2)', lineHeight:1.6, marginBottom:'12px' }}>{g.notes}</p>}
                <button onClick={()=>handleStatus(g.id, g.status)}
                  style={{ background:s.bg, color:s.color, border:'none', borderRadius:'20px', fontSize:'12px', fontWeight:600, padding:'5px 14px', cursor:'pointer' }}>
                  {s.label}
                </button>
              </div>
            )
          })}
      </div>
    </div>
  )
}
