import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import { today } from '../lib/utils.js'

export default function WaterPage() {
  const { user } = useAuth()
  const [oz, setOz] = useState(0)
  const [goal, setGoal] = useState(64)
  const [editGoal, setEditGoal] = useState(false)
  const [tempGoal, setTempGoal] = useState(64)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const [{ data: prof }, { data: hist }] = await Promise.all([
      supabase.from('profiles').select('water_goal').eq('id', user.id).single(),
      supabase.from('water_log').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(14)
    ])
    if (prof?.water_goal) { setGoal(prof.water_goal); setTempGoal(prof.water_goal) }
    setHistory(hist || [])
    const todayEntry = (hist || []).find(h => h.date === today())
    if (todayEntry) setOz(todayEntry.oz)
    setLoading(false)
  }

  async function updateOz(newOz) {
    const clamped = Math.max(0, newOz)
    setOz(clamped)
    await supabase.from('water_log').upsert({ user_id: user.id, date: today(), oz: clamped }, { onConflict: 'user_id,date' })
    setHistory(prev => {
      const filtered = prev.filter(h => h.date !== today())
      return [{ date: today(), oz: clamped }, ...filtered]
    })
  }

  async function saveGoal() {
    await supabase.from('profiles').upsert({ id: user.id, water_goal: tempGoal })
    setGoal(tempGoal); setEditGoal(false)
  }

  const pct = Math.min(100, Math.round((oz / goal) * 100))
  const cups = Math.round(oz / 8)
  const goalCups = Math.round(goal / 8)

  if (loading) return <div className="empty">Loading...</div>

  return (
    <div style={{ maxWidth:'600px' }}>
      <div className="page-header"><h1>Water intake</h1><p>Hydration is half the battle.</p></div>

      {/* Main tracker */}
      <div className="card" style={{ textAlign:'center' }}>
        <div style={{ position:'relative', width:'160px', height:'160px', margin:'0 auto 20px' }}>
          <svg width="160" height="160" style={{ transform:'rotate(-90deg)' }}>
            <circle cx="80" cy="80" r="68" fill="none" stroke="var(--surface3)" strokeWidth="12" />
            <circle cx="80" cy="80" r="68" fill="none" stroke="var(--blue)" strokeWidth="12"
              strokeDasharray={`${2 * Math.PI * 68}`}
              strokeDashoffset={`${2 * Math.PI * 68 * (1 - pct/100)}`}
              strokeLinecap="round" style={{ transition:'stroke-dashoffset 0.4s ease' }} />
          </svg>
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <div style={{ fontSize:'28px', fontWeight:800, color:'var(--blue)' }}>{oz}</div>
            <div style={{ fontSize:'12px', color:'var(--text3)' }}>of {goal} oz</div>
            <div style={{ fontSize:'11px', color:'var(--text3)' }}>{pct}%</div>
          </div>
        </div>

        <div style={{ fontSize:'13px', color:'var(--text2)', marginBottom:'20px' }}>{cups} of {goalCups} cups today</div>

        <div style={{ display:'flex', gap:'8px', justifyContent:'center', flexWrap:'wrap', marginBottom:'16px' }}>
          {[8, 12, 16, 20].map(amt => (
            <button key={amt} className="btn-ghost" style={{ fontSize:'13px' }} onClick={() => updateOz(oz + amt)}>
              +{amt} oz
            </button>
          ))}
        </div>

        <div style={{ display:'flex', gap:'8px', justifyContent:'center' }}>
          <button className="btn-ghost btn-sm" onClick={() => updateOz(oz - 8)}>− 8 oz</button>
          <button className="btn-danger btn-sm" onClick={() => updateOz(0)}>Reset</button>
        </div>
      </div>

      {/* Goal setter */}
      <div className="card">
        <p className="card-title">Daily goal</p>
        {editGoal ? (
          <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
            <input type="number" value={tempGoal} onChange={e => setTempGoal(parseInt(e.target.value))} style={{ width:'auto', flex:1 }} />
            <span style={{ color:'var(--text2)', fontSize:'13px' }}>oz</span>
            <button className="btn btn-sm" onClick={saveGoal}>Save</button>
            <button className="btn-ghost btn-sm" onClick={() => setEditGoal(false)}>Cancel</button>
          </div>
        ) : (
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <span style={{ fontSize:'20px', fontWeight:700, color:'var(--blue)' }}>{goal} oz</span>
            <span style={{ fontSize:'13px', color:'var(--text3)' }}>per day</span>
            <button className="btn-ghost btn-sm" onClick={() => setEditGoal(true)}>Change</button>
          </div>
        )}
        <div style={{ display:'flex', gap:'8px', marginTop:'10px', flexWrap:'wrap' }}>
          {[48, 64, 80, 96].map(g => (
            <button key={g} onClick={() => { setTempGoal(g); setGoal(g); supabase.from('profiles').upsert({ id: user.id, water_goal: g }) }}
              className="btn-ghost btn-sm" style={{ fontSize:'12px', background: goal===g ? 'var(--accent-soft)' : undefined, color: goal===g ? 'var(--accent)' : undefined }}>
              {g} oz
            </button>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="card">
        <p className="card-title">Last 14 days</p>
        {history.length === 0 ? <p className="empty">No history yet.</p> : history.map(h => (
          <div key={h.date} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
            <span style={{ fontSize:'12px', color:'var(--text3)', minWidth:'90px' }}>{h.date}</span>
            <div style={{ flex:1 }}>
              <div className="progress-track">
                <div style={{ height:'100%', borderRadius:'99px', background:'var(--blue)', width:`${Math.min(100,(h.oz/goal)*100)}%`, transition:'width 0.3s' }} />
              </div>
            </div>
            <span style={{ fontSize:'12px', color: h.oz >= goal ? 'var(--green)' : 'var(--text2)', fontWeight:600, minWidth:'50px', textAlign:'right' }}>{h.oz} oz</span>
          </div>
        ))}
      </div>
    </div>
  )
}
