import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import { today, fmtDate } from '../lib/utils.js'

export default function SleepPage() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [date, setDate] = useState(today())
  const [hours, setHours] = useState('')
  const [quality, setQuality] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('sleep_log').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(30)
    setLogs(data || [])
    setLoading(false)
  }

  async function handleSave() {
    const h = parseFloat(hours)
    if (!h || h < 0 || h > 24) return
    await supabase.from('sleep_log').upsert({ user_id: user.id, date, hours: h, quality }, { onConflict: 'user_id,date' })
    setHours(''); setQuality(null)
    load()
  }

  const avg = logs.length ? (logs.reduce((a, l) => a + l.hours, 0) / logs.length).toFixed(1) : null
  const best = logs.length ? Math.max(...logs.map(l => l.hours)) : null
  const last7 = logs.slice(0, 7)
  const avg7 = last7.length ? (last7.reduce((a, l) => a + l.hours, 0) / last7.length).toFixed(1) : null

  const qualityLabels = { 1:'😴 Poor', 2:'😐 Okay', 3:'🙂 Good', 4:'😊 Great', 5:'🌟 Amazing' }

  if (loading) return <div className="empty">Loading...</div>

  return (
    <div style={{ maxWidth:'700px' }}>
      <div className="page-header"><h1>Sleep tracker</h1><p>Recovery is where the gains happen.</p></div>

      <div className="stat-grid">
        <div className="stat-box"><div className="stat-label">7-day avg</div><div className="stat-value sv-blue">{avg7 || '—'}</div><div className="stat-sub">hours</div></div>
        <div className="stat-box"><div className="stat-label">All-time avg</div><div className="stat-value sv-accent">{avg || '—'}</div><div className="stat-sub">hours</div></div>
        <div className="stat-box"><div className="stat-label">Best night</div><div className="stat-value sv-green">{best || '—'}</div><div className="stat-sub">hours</div></div>
        <div className="stat-box"><div className="stat-label">Nights logged</div><div className="stat-value sv-amber">{logs.length}</div><div className="stat-sub">total</div></div>
      </div>

      <div className="card">
        <p className="card-title">Log sleep</p>
        <div className="form-grid-2 form-row">
          <div><label className="form-label">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
          <div><label className="form-label">Hours slept</label><input type="number" step="0.5" min="0" max="24" placeholder="7.5" value={hours} onChange={e => setHours(e.target.value)} /></div>
        </div>
        <div className="form-row">
          <label className="form-label">Sleep quality</label>
          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
            {[1,2,3,4,5].map(q => (
              <button key={q} onClick={() => setQuality(q)}
                style={{ background: quality===q ? 'var(--accent-soft)' : 'var(--surface2)', border:`1px solid ${quality===q ? 'var(--accent)' : 'var(--border2)'}`, borderRadius:'8px', color: quality===q ? 'var(--accent)' : 'var(--text2)', cursor:'pointer', fontSize:'13px', padding:'7px 14px', fontFamily:'inherit' }}>
                {qualityLabels[q]}
              </button>
            ))}
          </div>
        </div>
        <button className="btn" onClick={handleSave}>Log sleep</button>
      </div>

      <div className="card">
        <p className="card-title">History</p>
        {!logs.length ? <p className="empty">No sleep logs yet.</p> : logs.map(l => (
          <div key={l.date} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
            <span style={{ fontSize:'12px', color:'var(--text3)', minWidth:'90px' }}>{fmtDate(l.date)}</span>
            <div style={{ flex:1 }}>
              <div className="progress-track">
                <div style={{ height:'100%', borderRadius:'99px', width:`${Math.min(100,(l.hours/10)*100)}%`, transition:'width 0.3s',
                  background: l.hours >= 7 ? 'var(--green)' : l.hours >= 6 ? 'var(--amber)' : 'var(--red)' }} />
              </div>
            </div>
            <span style={{ fontSize:'13px', fontWeight:600, color: l.hours >= 7 ? 'var(--green)' : l.hours >= 6 ? 'var(--amber)' : 'var(--red)', minWidth:'40px' }}>{l.hours}h</span>
            {l.quality && <span style={{ fontSize:'13px' }}>{qualityLabels[l.quality]?.split(' ')[0]}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
