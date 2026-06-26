import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../lib/AuthContext.jsx'
import { getWeights, upsertWeight, deleteWeight } from '../lib/db.js'
import { supabase } from '../lib/supabase.js'
import { today, fmtDate } from '../lib/utils.js'

export default function WeightPage() {
  const { user } = useAuth()
  const [weights, setWeights] = useState([])
  const [goalWeight, setGoalWeight] = useState(null)
  const [date, setDate] = useState(today())
  const [val, setVal] = useState('')
  const [goalInput, setGoalInput] = useState('')
  const [loading, setLoading] = useState(true)
  const canvasRef = useRef(null)

  useEffect(() => { load() }, [])
  useEffect(() => { if (!loading) drawChart() }, [weights, goalWeight, loading])

  async function load() {
    const [w, { data: prof }] = await Promise.all([
      getWeights(),
      supabase.from('profiles').select('goal_weight').eq('id', user.id).single()
    ])
    setWeights(w)
    if (prof?.goal_weight) { setGoalWeight(prof.goal_weight); setGoalInput(prof.goal_weight) }
    setLoading(false)
  }

  async function handleLog() {
    const v = parseFloat(val)
    if (!v || v < 50 || v > 500) return
    await upsertWeight(date, v)
    setVal('')
    const w = await getWeights()
    setWeights(w)
  }

  async function handleGoal() {
    const v = parseFloat(goalInput)
    if (!v) return
    await supabase.from('profiles').upsert({ id: user.id, goal_weight: v })
    setGoalWeight(v)
  }

  async function handleDelete(d) {
    await deleteWeight(d)
    setWeights(weights.filter(w => w.date !== d))
  }

  function drawChart() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const entries = weights.slice(-14)
    const W = canvas.parentElement.clientWidth - 2
    const H = 200
    canvas.width = W; canvas.height = H
    ctx.clearRect(0, 0, W, H)
    if (entries.length < 2) {
      ctx.fillStyle = '#6b6a7a'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText('Log at least 2 entries to see your trend', W/2, H/2); return
    }
    const vals = entries.map(e => e.val)
    const minV = Math.min(...vals) - 3, maxV = Math.max(...vals) + 3
    const pad = { t:16, r:16, b:32, l:46 }
    const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b
    const xOf = i => pad.l + (i / (entries.length-1)) * cw
    const yOf = v => pad.t + ch - ((v - minV) / (maxV - minV)) * ch

    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + (ch/4) * i
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l+cw, y); ctx.stroke()
      const v = maxV - ((maxV-minV)/4)*i
      ctx.fillStyle='#6b6a7a'; ctx.font='10px sans-serif'; ctx.textAlign='right'
      ctx.fillText(v.toFixed(0), pad.l-6, y+3)
    }
    if (goalWeight && goalWeight >= minV && goalWeight <= maxV) {
      const gy = yOf(goalWeight)
      ctx.strokeStyle = 'rgba(34,201,122,0.5)'; ctx.setLineDash([4,4]); ctx.lineWidth=1.5
      ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(pad.l+cw, gy); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle='#22c97a'; ctx.font='10px sans-serif'; ctx.textAlign='left'
      ctx.fillText('goal', pad.l+cw+3, gy+3)
    }
    const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t+ch)
    grad.addColorStop(0, 'rgba(124,92,252,0.22)'); grad.addColorStop(1, 'rgba(124,92,252,0)')
    ctx.beginPath(); ctx.moveTo(xOf(0), yOf(vals[0]))
    vals.forEach((v,i) => { if(i>0) ctx.lineTo(xOf(i), yOf(v)) })
    ctx.lineTo(xOf(vals.length-1), pad.t+ch); ctx.lineTo(xOf(0), pad.t+ch); ctx.closePath()
    ctx.fillStyle=grad; ctx.fill()
    ctx.strokeStyle='#7c5cfc'; ctx.lineWidth=2.5; ctx.lineJoin='round'; ctx.setLineDash([])
    ctx.beginPath(); vals.forEach((v,i) => i===0 ? ctx.moveTo(xOf(i),yOf(v)) : ctx.lineTo(xOf(i),yOf(v))); ctx.stroke()
    vals.forEach((v,i) => {
      ctx.beginPath(); ctx.arc(xOf(i), yOf(v), 4, 0, Math.PI*2)
      ctx.fillStyle='#7c5cfc'; ctx.fill(); ctx.strokeStyle='#0d0d0f'; ctx.lineWidth=2; ctx.stroke()
    })
    ctx.fillStyle='#6b6a7a'; ctx.font='10px sans-serif'; ctx.textAlign='center'
    entries.forEach((e, i) => {
      if (i % Math.ceil(entries.length/7)===0 || i===entries.length-1) {
        const d=new Date(e.date+'T00:00:00'); ctx.fillText((d.getMonth()+1)+'/'+d.getDate(), xOf(i), H-8)
      }
    })
  }

  const startW = weights[0]?.val
  const currW = weights[weights.length-1]?.val
  const diff = startW && currW ? (currW - startW).toFixed(1) : null

  return (
    <div style={{ maxWidth:'800px' }}>
      <div className="page-header"><h1>Weight tracker</h1><p>Log daily. The trend is the truth.</p></div>

      <div className="stat-grid">
        <div className="stat-box"><div className="stat-label">Start</div><div className="stat-value">{startW?.toFixed(1) || '—'}</div><div className="stat-sub">lbs</div></div>
        <div className="stat-box"><div className="stat-label">Current</div><div className="stat-value">{currW?.toFixed(1) || '—'}</div><div className="stat-sub">lbs</div></div>
        <div className="stat-box">
          <div className="stat-label">Total change</div>
          <div className={`stat-value ${diff < 0 ? 'sv-green' : diff > 0 ? 'sv-red' : ''}`}>{diff !== null ? (diff > 0 ? `+${diff}` : diff) : '—'}</div>
          <div className="stat-sub">{diff < 0 ? 'lbs lost' : diff > 0 ? 'lbs gained' : 'lbs'}</div>
        </div>
        <div className="stat-box"><div className="stat-label">Goal</div><div className="stat-value sv-accent">{goalWeight?.toFixed(1) || '—'}</div><div className="stat-sub">lbs</div></div>
        <div className="stat-box">
          <div className="stat-label">To goal</div>
          <div className="stat-value sv-amber">{goalWeight && currW ? Math.max(0, (currW - goalWeight)).toFixed(1) : '—'}</div>
          <div className="stat-sub">lbs remaining</div>
        </div>
      </div>

      <div className="card">
        <p className="card-title">Log weight</p>
        <div className="form-grid-3 form-row">
          <div><label className="form-label">Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} /></div>
          <div><label className="form-label">Weight (lbs)</label><input type="number" placeholder="165.5" step="0.1" value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLog()} /></div>
          <div><label className="form-label">Goal weight (lbs)</label><input type="number" placeholder="145" step="0.1" value={goalInput} onChange={e=>setGoalInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleGoal()} /></div>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button className="btn" onClick={handleLog}>Log weight</button>
          <button className="btn-ghost" onClick={handleGoal}>Save goal</button>
        </div>
      </div>

      <div className="card">
        <p className="card-title">Trend — last 14 entries</p>
        <canvas ref={canvasRef} style={{ width:'100%', height:'200px', display:'block' }} />
      </div>

      <div className="card">
        <p className="card-title">History ({weights.length} entries)</p>
        {!weights.length ? <p className="empty">No entries yet.</p> : (
          <div className="log-list">
            {[...weights].reverse().map((w, i, arr) => {
              const prev = arr[i+1]
              const d = prev ? (w.val - prev.val).toFixed(1) : null
              return (
                <div key={w.date} className="log-item">
                  <span className="log-date">{fmtDate(w.date)}</span>
                  <span className="log-main">{w.val.toFixed(1)} lbs</span>
                  {d !== null && <span className={`badge ${d<0?'badge-green':d>0?'badge-red':'badge-accent'}`}>{d>0?'+':''}{d} lbs</span>}
                  <button className="btn-danger" onClick={() => handleDelete(w.date)}>✕</button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
