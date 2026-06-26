import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext.jsx'
import { getWakeups, toggleWakeup } from '../lib/db.js'
import { supabase } from '../lib/supabase.js'
import { today, calcStreak } from '../lib/utils.js'

export default function WakeupPage() {
  const { user } = useAuth()
  const [wakeups, setWakeups] = useState({})
  const [startDate, setStartDate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [targetTime, setTargetTime] = useState('04:00')
  const [editingTime, setEditingTime] = useState(false)
  const [tempTime, setTempTime] = useState('04:00')

  useEffect(() => { load() }, [])

  async function load() {
    const [w, { data: prof }] = await Promise.all([
      getWakeups(),
      supabase.from('profiles').select('start_date, wakeup_target_time').eq('id', user.id).single()
    ])
    setWakeups(w)
    if (prof?.start_date) setStartDate(prof.start_date)
    if (prof?.wakeup_target_time) {
      setTargetTime(prof.wakeup_target_time)
      setTempTime(prof.wakeup_target_time)
    }
    setLoading(false)
  }

  async function saveTargetTime() {
    await supabase.from('profiles').upsert({ id: user.id, wakeup_target_time: tempTime })
    setTargetTime(tempTime)
    setEditingTime(false)
  }

  async function handleToggle(ds) {
    const newChecked = !wakeups[ds]
    const newMap = { ...wakeups }
    if (newChecked) newMap[ds] = true; else delete newMap[ds]
    setWakeups(newMap)
    await toggleWakeup(ds, newChecked)
  }

  const streak = calcStreak(wakeups)
  const total = Object.keys(wakeups).length
  const td = today()

  function fmt12(time24) {
    if (!time24) return ''
    const [h, m] = time24.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
  }

  function calcBest() {
    if (!startDate) return 0
    const s = new Date(startDate + 'T00:00:00')
    let best = 0, curr = 0
    for (let i = 0; i < 90; i++) {
      const d = new Date(s); d.setDate(s.getDate() + i)
      const key = d.toISOString().split('T')[0]
      if (wakeups[key]) { curr++; best = Math.max(best, curr) } else curr = 0
    }
    return best
  }

  const startForGrid = startDate ? new Date(startDate + 'T00:00:00') : new Date()

  if (loading) return <div className="empty">Loading...</div>

  return (
    <div style={{ maxWidth:'800px' }}>
      <div className="page-header">
        <h1>Wake-up log</h1>
        <p>Set your target time and check off every day you hit it.</p>
      </div>

      {/* Target time setter */}
      <div className="card" style={{ display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'12px', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.7px', fontWeight:700, marginBottom:'4px' }}>Target wake-up time</div>
          {editingTime ? (
            <div style={{ display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap' }}>
              <input type="time" value={tempTime} onChange={e => setTempTime(e.target.value)} style={{ width:'auto', fontSize:'18px', fontWeight:700 }} />
              <button className="btn btn-sm" onClick={saveTargetTime}>Save</button>
              <button className="btn-ghost btn-sm" onClick={() => setEditingTime(false)}>Cancel</button>
            </div>
          ) : (
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <span style={{ fontSize:'28px', fontWeight:800, color:'var(--amber)', letterSpacing:'-0.5px' }}>{fmt12(targetTime)}</span>
              <button className="btn-ghost btn-sm" onClick={() => setEditingTime(true)}>Change</button>
            </div>
          )}
        </div>
        <div style={{ textAlign:'center', padding:'12px 20px', background:'var(--surface2)', borderRadius:'10px', border:'1px solid var(--border)' }}>
          <div style={{ fontSize:'11px', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'4px' }}>Today</div>
          <div
            onClick={() => handleToggle(td)}
            style={{
              width:'52px', height:'52px', borderRadius:'50%', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px',
              background: wakeups[td] ? 'var(--green-soft)' : 'var(--surface3)',
              border: `2px solid ${wakeups[td] ? 'var(--green)' : 'var(--border2)'}`,
              transition:'all 0.15s'
            }}>
            {wakeups[td] ? '✓' : '○'}
          </div>
          <div style={{ fontSize:'11px', color: wakeups[td] ? 'var(--green)' : 'var(--text3)', marginTop:'4px', fontWeight:600 }}>
            {wakeups[td] ? 'Hit it!' : 'Tap to log'}
          </div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-box"><div className="stat-label">Current streak</div><div className="stat-value sv-green">{streak}</div><div className="stat-sub">days in a row</div></div>
        <div className="stat-box"><div className="stat-label">Best streak</div><div className="stat-value sv-amber">{calcBest()}</div><div className="stat-sub">days</div></div>
        <div className="stat-box"><div className="stat-label">Total hits</div><div className="stat-value sv-blue">{total}</div><div className="stat-sub">out of 90 days</div></div>
        <div className="stat-box"><div className="stat-label">Success rate</div><div className="stat-value sv-accent">{total > 0 ? Math.round((total/90)*100) : 0}%</div><div className="stat-sub">of 90 days</div></div>
      </div>

      <div className="card">
        <p className="card-title">90-day calendar — tap to toggle</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(38px, 1fr))', gap:'5px', marginTop:'8px' }}>
          {Array.from({ length: 90 }, (_, i) => {
            const d = new Date(startForGrid); d.setDate(startForGrid.getDate() + i)
            const ds = d.toISOString().split('T')[0]
            const isToday = ds === td
            const checked = !!wakeups[ds]
            return (
              <div key={i} onClick={() => handleToggle(ds)}
                style={{
                  aspectRatio:'1', borderRadius:'6px', display:'flex', alignItems:'center',
                  justifyContent:'center', cursor:'pointer', fontSize:'10px', fontWeight:600,
                  userSelect:'none', transition:'all 0.12s',
                  background: checked ? 'var(--green-soft)' : 'var(--surface2)',
                  color: checked ? 'var(--green)' : 'var(--text3)',
                  border: isToday ? '2px solid var(--accent)' : `1px solid ${checked ? 'rgba(34,201,122,0.3)' : 'var(--border2)'}`,
                }}>
                {i + 1}
              </div>
            )
          })}
        </div>
        <div style={{ display:'flex', gap:'16px', marginTop:'14px', fontSize:'12px', color:'var(--text3)' }}>
          <span style={{ display:'flex', alignItems:'center', gap:'5px' }}><span style={{ width:10, height:10, borderRadius:2, background:'var(--green-soft)', border:'1px solid rgba(34,201,122,0.3)', display:'inline-block' }} /> Hit target</span>
          <span style={{ display:'flex', alignItems:'center', gap:'5px' }}><span style={{ width:10, height:10, borderRadius:2, background:'var(--surface2)', border:'2px solid var(--accent)', display:'inline-block' }} /> Today</span>
        </div>
      </div>
    </div>
  )
}
