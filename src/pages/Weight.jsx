import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Trash2 } from 'lucide-react'

export default function Weight() {
  const { user, profile } = useAuth()
  const [weights, setWeights] = useState([])
  const [goalWeight, setGoalWeightState] = useState(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [val, setVal] = useState('')
  const [goalInput, setGoalInput] = useState('')
  const [loading, setLoading] = useState(false)
  const canvasRef = useRef(null)

  useEffect(() => { if (user) loadWeights() }, [user])
  useEffect(() => { if (weights.length) drawChart() }, [weights, goalWeight])

  async function loadWeights() {
    const { data } = await supabase.from('weights').select('*').eq('user_id', user.id).order('date')
    setWeights(data || [])
    const gw = profile?.goal_weight
    if (gw) { setGoalWeightState(gw); setGoalInput(gw) }
  }

  async function logWeight() {
    if (!val || isNaN(val)) return
    setLoading(true)
    try {
      await supabase.from('weights').upsert({ user_id: user.id, date, val: parseFloat(val) }, { onConflict: 'user_id,date' })
      setVal('')
      await loadWeights()
    } finally { setLoading(false) }
  }

  async function saveGoal() {
    if (!goalInput) return
    const g = parseFloat(goalInput)
    await supabase.from('profiles').update({ goal_weight: g }).eq('id', user.id)
    setGoalWeightState(g)
  }

  async function deleteWeight(id) {
    await supabase.from('weights').delete().eq('id', id)
    setWeights(w => w.filter(x => x.id !== id))
  }

  const startW = weights[0]?.val
  const currW = weights[weights.length - 1]?.val
  const diff = startW && currW ? (currW - startW).toFixed(1) : null
  const isLoss = diff < 0

  function fmtDate(ds) {
    return new Date(ds + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  function drawChart() {
    const canvas = canvasRef.current
    if (!canvas || weights.length < 2) return
    const entries = weights.slice(-14)
    const W = canvas.parentElement.clientWidth - 2
    const H = 200
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, W, H)

    const vals = entries.map(e => e.val)
    const minV = Math.min(...vals, goalWeight || Infinity) - 3
    const maxV = Math.max(...vals) + 3
    const pad = { t: 16, r: 20, b: 30, l: 44 }
    const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b
    const xOf = i => pad.l + (i / (entries.length - 1)) * cw
    const yOf = v => pad.t + ch - ((v - minV) / (maxV - minV)) * ch

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + (ch / 4) * i
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + cw, y); ctx.stroke()
      const v = maxV - ((maxV - minV) / 4) * i
      ctx.fillStyle = '#5e5c72'; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'right'
      ctx.fillText(v.toFixed(0), pad.l - 6, y + 3)
    }

    // Goal line
    if (goalWeight && goalWeight > minV && goalWeight < maxV) {
      const gy = yOf(goalWeight)
      ctx.strokeStyle = 'rgba(31,202,118,0.5)'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(pad.l + cw, gy); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#1fca76'; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'left'
      ctx.fillText('goal', pad.l + cw + 4, gy + 3)
    }

    // Fill
    const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + ch)
    grad.addColorStop(0, 'rgba(124,92,252,0.22)'); grad.addColorStop(1, 'rgba(124,92,252,0)')
    ctx.beginPath(); ctx.moveTo(xOf(0), yOf(vals[0]))
    vals.forEach((v, i) => { if (i > 0) ctx.lineTo(xOf(i), yOf(v)) })
    ctx.lineTo(xOf(vals.length - 1), pad.t + ch); ctx.lineTo(xOf(0), pad.t + ch)
    ctx.closePath(); ctx.fillStyle = grad; ctx.fill()

    // Line
    ctx.strokeStyle = '#7c5cfc'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.setLineDash([])
    ctx.beginPath()
    vals.forEach((v, i) => i === 0 ? ctx.moveTo(xOf(i), yOf(v)) : ctx.lineTo(xOf(i), yOf(v)))
    ctx.stroke()

    // Dots
    vals.forEach((v, i) => {
      ctx.beginPath(); ctx.arc(xOf(i), yOf(v), 4, 0, Math.PI * 2)
      ctx.fillStyle = '#7c5cfc'; ctx.fill()
      ctx.strokeStyle = '#07070a'; ctx.lineWidth = 2; ctx.stroke()
    })

    // X labels
    ctx.fillStyle = '#5e5c72'; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'center'
    entries.forEach((e, i) => {
      if (i % Math.ceil(entries.length / 6) === 0 || i === entries.length - 1) {
        const d = new Date(e.date + 'T00:00:00')
        ctx.fillText((d.getMonth() + 1) + '/' + d.getDate(), xOf(i), H - 8)
      }
    })
  }

  return (
    <div>
      <div className="page-header">
        <h1>Weight tracker</h1>
        <p>Log daily. Watch the trend move.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-box">
          <div className="stat-label">Starting weight</div>
          <div className="stat-value">{startW?.toFixed(1) || '—'}</div>
          <div className="stat-sub">lbs</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Current weight</div>
          <div className="stat-value">{currW?.toFixed(1) || '—'}</div>
          <div className="stat-sub">lbs</div>
        </div>
        <div className={`stat-box ${diff === null ? '' : isLoss ? 'stat-green' : 'stat-red'}`}>
          <div className="stat-label">Total change</div>
          <div className="stat-value">{diff !== null ? (diff > 0 ? '+' : '') + diff : '—'}</div>
          <div className="stat-sub">{isLoss ? 'lbs lost 🎉' : diff > 0 ? 'lbs gained' : 'lbs'}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Goal weight</div>
          <div className="stat-value">{goalWeight?.toFixed(1) || '—'}</div>
          <div className="stat-sub">lbs target</div>
        </div>
        <div className="stat-box stat-amber">
          <div className="stat-label">To goal</div>
          <div className="stat-value">{goalWeight && currW ? Math.max(0, currW - goalWeight).toFixed(1) : '—'}</div>
          <div className="stat-sub">lbs remaining</div>
        </div>
      </div>

      <div className="card">
        <p className="card-title">Log weight</p>
        <div className="form-row cols-3">
          <div><label className="form-label">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
          <div><label className="form-label">Weight (lbs)</label><input type="number" value={val} onChange={e => setVal(e.target.value)} placeholder="e.g. 172.5" step="0.1" min="50" max="500" /></div>
          <div><label className="form-label">Goal weight (lbs)</label><div style={{ display: 'flex', gap: 6 }}><input type="number" value={goalInput} onChange={e => setGoalInput(e.target.value)} placeholder="e.g. 155" step="0.1" /><button className="btn-ghost" onClick={saveGoal} style={{ whiteSpace: 'nowrap', padding: '10px 12px' }}>Set</button></div></div>
        </div>
        <button className="btn" onClick={logWeight} disabled={loading}>{loading ? 'Saving...' : 'Log weight'}</button>
      </div>

      <div className="card">
        <p className="card-title">Trend (last 14 entries)</p>
        {weights.length < 2
          ? <p className="empty">Log at least 2 entries to see your trend chart.</p>
          : <canvas ref={canvasRef} style={{ width: '100%', display: 'block' }} />
        }
      </div>

      <div className="card">
        <p className="card-title">History</p>
        {!weights.length
          ? <p className="empty">No entries yet.</p>
          : <div className="log-list">
              {[...weights].reverse().map((w, i, arr) => {
                const prev = arr[i + 1]
                const delta = prev ? (w.val - prev.val).toFixed(1) : null
                return (
                  <div key={w.id} className="log-item">
                    <span className="log-date">{fmtDate(w.date)}</span>
                    <span className="log-main" style={{ fontWeight: 600 }}>{w.val.toFixed(1)} lbs</span>
                    {delta !== null && (
                      <span className={`badge ${delta < 0 ? 'badge-green' : delta > 0 ? 'badge-red' : 'badge-accent'}`}>
                        {delta > 0 ? '+' : ''}{delta} lbs
                      </span>
                    )}
                    <button className="btn-danger" onClick={() => deleteWeight(w.id)}><Trash2 size={12} /></button>
                  </div>
                )
              })}
            </div>
        }
      </div>
    </div>
  )
}
