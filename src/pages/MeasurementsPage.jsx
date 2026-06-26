import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import { today, fmtDate } from '../lib/utils.js'

const FIELDS = [
  { key: 'waist', label: 'Waist', icon: '📏' },
  { key: 'hips', label: 'Hips', icon: '📐' },
  { key: 'chest', label: 'Chest', icon: '💪' },
  { key: 'arms', label: 'Arms', icon: '💪' },
  { key: 'thighs', label: 'Thighs', icon: '📏' },
  { key: 'neck', label: 'Neck', icon: '📏' },
]

export default function MeasurementsPage() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [form, setForm] = useState({})
  const [date, setDate] = useState(today())
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('measurements').select('*').eq('user_id', user.id).order('date', { ascending: false })
    setLogs(data || [])
    setLoading(false)
  }

  async function handleSave() {
    if (!Object.values(form).some(v => v)) return
    await supabase.from('measurements').upsert({ user_id: user.id, date, ...form }, { onConflict: 'user_id,date' })
    setForm({})
    load()
  }

  async function handleDelete(id) {
    await supabase.from('measurements').delete().eq('id', id)
    setLogs(logs.filter(l => l.id !== id))
  }

  const first = logs[logs.length - 1]
  const latest = logs[0]

  if (loading) return <div className="empty">Loading...</div>

  return (
    <div style={{ maxWidth:'800px' }}>
      <div className="page-header"><h1>Measurements</h1><p>Track inches lost. The scale doesn't tell the whole story.</p></div>

      {first && latest && first.id !== latest.id && (
        <div className="stat-grid">
          {FIELDS.map(f => {
            const diff = latest[f.key] && first[f.key] ? (latest[f.key] - first[f.key]).toFixed(1) : null
            return (
              <div key={f.key} className="stat-box">
                <div className="stat-label">{f.label}</div>
                <div className={`stat-value ${diff < 0 ? 'sv-green' : diff > 0 ? 'sv-red' : ''}`}>{diff !== null ? (diff > 0 ? `+${diff}` : diff) : '—'}</div>
                <div className="stat-sub">inches since start</div>
              </div>
            )
          })}
        </div>
      )}

      <div className="card">
        <p className="card-title">Log measurements (inches)</p>
        <div className="form-row"><label className="form-label">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width:'auto' }} /></div>
        <div className="form-grid-3 form-row">
          {FIELDS.map(f => (
            <div key={f.key}>
              <label className="form-label">{f.label}</label>
              <input type="number" step="0.1" placeholder="0.0" value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: parseFloat(e.target.value) || '' })} />
            </div>
          ))}
        </div>
        <button className="btn" onClick={handleSave}>Save measurements</button>
      </div>

      <div className="card">
        <p className="card-title">History</p>
        {!logs.length ? <p className="empty">No measurements yet.</p> : logs.map(l => (
          <div key={l.id} style={{ padding:'12px 0', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'10px' }}>
            <span style={{ fontSize:'12px', color:'var(--text3)', minWidth:'90px' }}>{fmtDate(l.date)}</span>
            <div style={{ flex:1, display:'flex', gap:'12px', flexWrap:'wrap' }}>
              {FIELDS.map(f => l[f.key] ? (
                <span key={f.key} style={{ fontSize:'12px', color:'var(--text2)' }}><span style={{ color:'var(--text3)' }}>{f.label}:</span> {l[f.key]}"</span>
              ) : null)}
            </div>
            <button className="btn-danger" onClick={() => handleDelete(l.id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
