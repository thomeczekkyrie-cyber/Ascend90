import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext.jsx'
import { getJournal, upsertJournal, deleteJournal } from '../lib/db.js'
import { today, fmtDate } from '../lib/utils.js'
import { useNavigate } from 'react-router-dom'

export default function JournalPage() {
  const { isPremium } = useAuth()
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [date, setDate] = useState(today())
  const [text, setText] = useState('')
  const [win, setWin] = useState('')
  const [energy, setEnergy] = useState(null)
  const [mood, setMood] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (isPremium) getJournal().then(e => { setEntries(e); setLoading(false) }); else setLoading(false) }, [isPremium])

  async function handleSave() {
    if (!text.trim() && !win.trim()) return
    await upsertJournal({ date, text, win, energy, mood })
    setText(''); setWin(''); setEnergy(null); setMood(null)
    setEntries(await getJournal())
  }

  async function handleDelete(d) {
    await deleteJournal(d)
    setEntries(entries.filter(e => e.date !== d))
  }

  if (!isPremium) return (
    <div style={{ maxWidth:'800px' }}>
      <div className="page-header"><h1>Daily journal</h1></div>
      <div className="card" style={{ textAlign:'center', padding:'48px' }}>
        <div style={{ fontSize:'40px', marginBottom:'16px' }}>📓</div>
        <h2 style={{ fontSize:'20px', fontWeight:700, marginBottom:'10px' }}>Journal is a Premium feature</h2>
        <p style={{ color:'var(--text2)', fontSize:'14px', lineHeight:1.6, maxWidth:'380px', margin:'0 auto 24px' }}>
          Log your daily mood, energy, reflections, and wins. Track patterns over 90 days. Only on Premium.
        </p>
        <button className="btn" onClick={() => navigate('/app/account')}>Upgrade to Premium — $8/mo</button>
      </div>
    </div>
  )

  if (loading) return <div className="empty">Loading...</div>

  const MoodPicker = ({ type, value, onChange }) => {
    const opts = type === 'energy'
      ? ['1 – Drained','2 – Low','3 – Okay','4 – Good','5 – Fired up']
      : ['1 – Rough','2 – Meh','3 – Stable','4 – Positive','5 – Great']
    return (
      <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
        {opts.map((o, i) => (
          <button key={i} onClick={() => onChange(i+1)}
            style={{ background: value===i+1 ? 'var(--amber-soft)' : 'var(--surface2)', border:`1px solid ${value===i+1 ? 'rgba(245,166,35,0.3)' : 'var(--border2)'}`, borderRadius:'7px', color: value===i+1 ? 'var(--amber)' : 'var(--text2)', cursor:'pointer', fontSize:'13px', padding:'6px 12px', transition:'all 0.15s', fontFamily:'inherit' }}>
            {o}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div style={{ maxWidth:'800px' }}>
      <div className="page-header"><h1>Daily journal</h1><p>Mood, energy, wins, reflections. One entry a day keeps the drift away.</p></div>

      <div className="card">
        <p className="card-title">Today's entry</p>
        <div className="form-row"><label className="form-label">Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{ width:'auto' }} /></div>
        <div className="form-row"><label className="form-label">Energy</label><MoodPicker type="energy" value={energy} onChange={setEnergy} /></div>
        <div className="form-row"><label className="form-label">Mood</label><MoodPicker type="mood" value={mood} onChange={setMood} /></div>
        <div className="form-row"><label className="form-label">Reflection</label><textarea placeholder="What happened today? What's on your mind?" value={text} onChange={e=>setText(e.target.value)} rows={4} /></div>
        <div className="form-row"><label className="form-label">Win of the day 🏆</label><input type="text" placeholder="Something you're proud of, however small." value={win} onChange={e=>setWin(e.target.value)} /></div>
        <button className="btn" onClick={handleSave}>Save entry</button>
      </div>

      <div className="card">
        <p className="card-title">Past entries ({entries.length})</p>
        {!entries.length ? <p className="empty">No entries yet. Write your first one above.</p> : entries.map(e => (
          <div key={e.date} style={{ borderBottom:'1px solid var(--border)', padding:'14px 0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
              <span style={{ fontSize:'12px', color:'var(--text3)', fontWeight:600 }}>{fmtDate(e.date)}</span>
              <button className="btn-danger" onClick={() => handleDelete(e.date)}>✕</button>
            </div>
            {(e.energy || e.mood) && (
              <div style={{ display:'flex', gap:'16px', marginBottom:'8px', fontSize:'12px', color:'var(--text3)' }}>
                {e.energy && <span>Energy: <span style={{ color:'var(--amber)' }}>{'●'.repeat(e.energy)}{'○'.repeat(5-e.energy)}</span></span>}
                {e.mood && <span>Mood: <span style={{ color:'var(--blue)' }}>{'●'.repeat(e.mood)}{'○'.repeat(5-e.mood)}</span></span>}
              </div>
            )}
            {e.text && <p style={{ fontSize:'14px', color:'var(--text)', lineHeight:1.6, marginBottom: e.win ? '8px' : 0 }}>{e.text}</p>}
            {e.win && <p style={{ fontSize:'13px', color:'var(--green)' }}>🏆 {e.win}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
