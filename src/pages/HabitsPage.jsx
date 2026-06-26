import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext.jsx'
import { getHabits, insertHabit, deleteHabit, getHabitLog, toggleHabitLog } from '../lib/db.js'
import { today, calcHabitStreak, getLast7Days, PLAN_LIMITS, CAT_COLORS } from '../lib/utils.js'
import { useNavigate } from 'react-router-dom'

export default function HabitsPage() {
  const { isPremium } = useAuth()
  const navigate = useNavigate()
  const [habits, setHabits] = useState([])
  const [habitLog, setHabitLog] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCat, setNewCat] = useState('health')
  const [loading, setLoading] = useState(true)

  const limit = isPremium ? Infinity : PLAN_LIMITS.free.habits
  const td = today()
  const last7 = getLast7Days()

  useEffect(() => { load() }, [])

  async function load() {
    const [h, log] = await Promise.all([getHabits(), getHabitLog()])
    setHabits(h); setHabitLog(log); setLoading(false)
  }

  async function handleAdd() {
    if (!newName.trim()) return
    if (habits.length >= limit) return
    await insertHabit(newName.trim(), newCat)
    setNewName(''); setShowForm(false)
    setHabits(await getHabits())
  }

  async function handleToggle(habitId) {
    const checked = !(habitLog[td] || []).includes(habitId)
    const newLog = { ...habitLog }
    if (!newLog[td]) newLog[td] = []
    if (checked) newLog[td] = [...newLog[td], habitId]
    else newLog[td] = newLog[td].filter(id => id !== habitId)
    setHabitLog(newLog)
    await toggleHabitLog(habitId, td, checked)
  }

  async function handleDelete(id) {
    await deleteHabit(id)
    setHabits(habits.filter(h => h.id !== id))
  }

  const done = habits.filter(h => (habitLog[td] || []).includes(h.id)).length

  if (loading) return <div className="empty">Loading...</div>

  return (
    <div style={{ maxWidth:'800px' }}>
      <div className="page-header"><h1>Daily habits</h1><p>Check off your habits each day. Streaks build the person you're becoming.</p></div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', flexWrap:'wrap', gap:'8px' }}>
        <div>
          <span style={{ fontSize:'14px', color:'var(--text2)' }}>Today: </span>
          <span style={{ fontSize:'14px', fontWeight:600, color: done===habits.length&&habits.length>0 ? 'var(--green)' : 'var(--text)' }}>
            {done}/{habits.length} complete {done===habits.length&&habits.length>0 ? '🎉' : ''}
          </span>
          {!isPremium && <span style={{ fontSize:'12px', color:'var(--text3)', marginLeft:'10px' }}>{habits.length}/{limit} habits (free plan)</span>}
        </div>
        <button className="btn-ghost" onClick={() => { if (habits.length >= limit && !isPremium) { navigate('/app/account') } else setShowForm(!showForm) }}>
          {habits.length >= limit && !isPremium ? '🔒 Upgrade for more' : '+ Add habit'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <p className="card-title">New habit</p>
          <div className="form-grid-2 form-row">
            <div><label className="form-label">Habit name</label><input type="text" placeholder="e.g. Drink 64oz water" value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAdd()} /></div>
            <div><label className="form-label">Category</label>
              <select value={newCat} onChange={e=>setNewCat(e.target.value)}>
                {['health','fitness','mindset','business','personal'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            <button className="btn" onClick={handleAdd}>Add habit</button>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card" style={{ padding:'8px 16px' }}>
        {!habits.length ? <p className="empty">No habits yet. Add your first one above.</p> : habits.map(h => {
          const checked = (habitLog[td] || []).includes(h.id)
          const streak = calcHabitStreak(h.id, habitLog)
          const c = CAT_COLORS[h.cat] || CAT_COLORS.personal
          return (
            <div key={h.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
              <div onClick={() => handleToggle(h.id)}
                style={{ width:22, height:22, borderRadius:5, flexShrink:0, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s',
                  background: checked ? 'var(--green)' : 'transparent',
                  border: `2px solid ${checked ? 'var(--green)' : 'var(--border2)'}` }}>
                {checked && <span style={{ color:'#000', fontSize:'13px', fontWeight:700 }}>✓</span>}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'14px', fontWeight:500, textDecoration: checked ? 'line-through' : 'none', color: checked ? 'var(--text3)' : 'var(--text)' }}>{h.name}</div>
                <div style={{ display:'flex', gap:'6px', alignItems:'center', marginTop:'4px' }}>
                  <span style={{ fontSize:'10px', fontWeight:700, padding:'2px 7px', borderRadius:'4px', textTransform:'uppercase', letterSpacing:'0.5px', background:c.bg, color:c.text }}>{h.cat}</span>
                  <div style={{ display:'flex', gap:'3px' }}>
                    {last7.map(d => <div key={d} style={{ width:7, height:7, borderRadius:'50%', background: (habitLog[d]||[]).includes(h.id) ? 'var(--green)' : 'var(--surface3)' }} />)}
                  </div>
                </div>
              </div>
              {streak > 0 && <span style={{ fontSize:'12px', color:'var(--amber)', flexShrink:0 }}>🔥 {streak}</span>}
              <button className="btn-danger" onClick={() => handleDelete(h.id)}>✕</button>
            </div>
          )
        })}
      </div>

      <div className="card">
        <p className="card-title">Today's progress</p>
        <div className="progress-track"><div className="progress-fill pf-green" style={{ width: habits.length ? `${Math.round((done/habits.length)*100)}%` : '0%' }} /></div>
        <p style={{ fontSize:'12px', color:'var(--text3)', marginTop:'8px' }}>{habits.length ? Math.round((done/habits.length)*100) : 0}% of today's habits complete</p>
      </div>
    </div>
  )
}
