import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'
import { getWeights, getWakeups, getWorkouts, getHabits, getHabitLog, getGoals } from '../lib/db.js'
import { today, currentDay, calcStreak } from '../lib/utils.js'
import { supabase } from '../lib/supabase.js'

const QUOTES = [
  "The secret of getting ahead is getting started.",
  "You don't have to be great to start, but you have to start to be great.",
  "Small daily improvements lead to stunning results.",
  "Discipline is the bridge between goals and accomplishment.",
  "Every day is a chance to be better than yesterday.",
  "The body achieves what the mind believes.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Don't wish for it. Work for it.",
  "Your only competition is who you were yesterday.",
  "Consistency is what transforms average into excellence.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "You are one decision away from a totally different life.",
  "Wake up with determination. Go to bed with satisfaction.",
  "It always seems impossible until it's done.",
  "Push yourself because no one else is going to do it for you.",
]

function Confetti() {
  const colors = ['#e03d3d','#22c97a','#f5a623','#4a9eff','#f06292','#fbbf24']
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    duration: 2 + Math.random() * 3,
    delay: Math.random() * 2,
    size: 6 + Math.random() * 10,
  }))
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:9999 }}>
      {pieces.map(p => (
        <div key={p.id} className="confetti-piece" style={{
          left: `${p.left}%`, background: p.color,
          width: p.size, height: p.size,
          animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`,
        }} />
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { user, isPremium } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [startDate, setStartDate] = useState(null)
  const [startInput, setStartInput] = useState(today())
  const [loading, setLoading] = useState(true)
  const [isBirthday, setIsBirthday] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const quote = QUOTES[new Date().getDate() % QUOTES.length]

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const { data: prof } = await supabase.from('profiles').select('start_date, goal_weight, birthday').eq('id', user.id).single()
    if (prof?.start_date) setStartDate(prof.start_date)

    if (prof?.birthday) {
      const bday = new Date(prof.birthday + 'T00:00:00')
      const now = new Date()
      if (bday.getMonth() === now.getMonth() && bday.getDate() === now.getDate()) {
        setIsBirthday(true)
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 6000)
      }
    }

    const [weights, wakeups, workouts, habits, habitLog, goals] = await Promise.all([
      getWeights(), getWakeups(), getWorkouts(), getHabits(), getHabitLog(), getGoals()
    ])
    setData({ weights, wakeups, workouts, habits, habitLog, goals })
    setLoading(false)
  }

  async function saveStartDate() {
    await supabase.from('profiles').upsert({ id: user.id, start_date: startInput })
    setStartDate(startInput)
  }

  if (loading) return <div className="empty">Loading your dashboard...</div>

  const name = user?.user_metadata?.full_name?.split(' ')[0] || 'there'
  const day = currentDay(startDate)
  const pct = Math.round((day / 90) * 100)
  const daysLeft = 90 - day
  const weightLost = data.weights.length >= 2 ? (data.weights[0].val - data.weights[data.weights.length - 1].val).toFixed(1) : null
  const wakeupStreak = calcStreak(data.wakeups)
  const habitsToday = data.habits.filter(h => (data.habitLog[today()] || []).includes(h.id)).length
  const goalsDone = data.goals.filter(g => g.status === 'done').length
  const hours = new Date().getHours()
  const greeting = hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ maxWidth:'800px' }}>
      {showConfetti && <Confetti />}

      {isBirthday && (
        <div style={{ background:'linear-gradient(135deg, var(--accent), var(--amber))', borderRadius:'16px', padding:'20px 24px', marginBottom:'20px', textAlign:'center' }}>
          <div style={{ fontSize:'36px', marginBottom:'8px' }}>🎂</div>
          <div style={{ fontSize:'22px', fontWeight:800, color:'#fff', marginBottom:'4px' }}>Happy Birthday, {name}!</div>
          <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.85)' }}>What a perfect day to keep showing up. You've got this. 🎉</div>
        </div>
      )}

      <div className="page-header">
        <h1>{greeting}, {name} 👊</h1>
        <p>{new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}</p>
      </div>

      {/* Quote of the day */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', padding:'14px 18px', marginBottom:'18px', borderLeft:'3px solid var(--accent)' }}>
        <div style={{ fontSize:'11px', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:'5px' }}>Quote of the day</div>
        <div style={{ fontSize:'14px', color:'var(--text2)', fontStyle:'italic', lineHeight:1.6 }}>"{quote}"</div>
      </div>

      <div className="card" style={{ display:'flex', gap:'20px', alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ width:'76px', height:'76px', borderRadius:'50%', border:'3px solid var(--accent)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <span style={{ fontSize:'22px', fontWeight:800, color:'var(--accent)', lineHeight:1 }}>{day}</span>
          <span style={{ fontSize:'9px', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.5px' }}>of 90</span>
        </div>
        <div style={{ flex:1, minWidth:'180px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
            <span style={{ fontSize:'13px', color:'var(--text2)' }}>90-day progress</span>
            <span style={{ fontSize:'13px', color:'var(--accent)', fontWeight:600 }}>{pct}%</span>
          </div>
          <div className="progress-track" style={{ height:'10px' }}>
            <div className="progress-fill" style={{ width:`${pct}%` }} />
          </div>
          <p style={{ fontSize:'12px', color:'var(--text3)', marginTop:'6px' }}>
            {startDate ? (daysLeft > 0 ? `${daysLeft} days remaining` : 'Final day! Finish strong.') : 'Set your start date to begin'}
          </p>
        </div>
      </div>

      {!startDate && (
        <div className="card">
          <p className="card-title">Set your start date</p>
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
            <input type="date" value={startInput} onChange={e => setStartInput(e.target.value)} style={{ width:'auto', flex:1, minWidth:'160px' }} />
            <button className="btn" onClick={saveStartDate}>Start my 90 days</button>
          </div>
        </div>
      )}

      <div className="stat-grid">
        <div className="stat-box" onClick={() => navigate('/app/weight')}>
          <div className="stat-label">Weight change</div>
          <div className={`stat-value ${weightLost > 0 ? 'sv-green' : weightLost < 0 ? 'sv-red' : ''}`}>
            {weightLost !== null ? (weightLost > 0 ? `-${weightLost}` : `+${Math.abs(weightLost)}`) : '—'}
          </div>
          <div className="stat-sub">lbs since start</div>
        </div>
        <div className="stat-box" onClick={() => navigate('/app/wakeup')}>
          <div className="stat-label">Wake-up streak</div>
          <div className="stat-value sv-amber">{wakeupStreak}</div>
          <div className="stat-sub">days in a row</div>
        </div>
        <div className="stat-box" onClick={() => navigate('/app/workouts')}>
          <div className="stat-label">Workouts</div>
          <div className="stat-value sv-blue">{data.workouts.length}</div>
          <div className="stat-sub">logged total</div>
        </div>
        <div className="stat-box" onClick={() => navigate('/app/habits')}>
          <div className="stat-label">Habits today</div>
          <div className="stat-value sv-accent">{habitsToday}/{data.habits.length}</div>
          <div className="stat-sub">completed</div>
        </div>
        <div className="stat-box" onClick={() => navigate('/app/goals')}>
          <div className="stat-label">Goals done</div>
          <div className="stat-value sv-green">{goalsDone}</div>
          <div className="stat-sub">of {data.goals.length} goals</div>
        </div>
      </div>

      <div className="card">
        <p className="card-title">Today's remaining</p>
        {(() => {
          const td = today()
          const pendingHabits = data.habits.filter(h => !(data.habitLog[td] || []).includes(h.id))
          const noWakeup = !data.wakeups[td]
          if (!noWakeup && !pendingHabits.length) return (
            <div style={{ textAlign:'center', padding:'20px', color:'var(--green)', fontWeight:600 }}>All done for today! 🎉</div>
          )
          return (
            <div className="log-list">
              {noWakeup && (
                <div className="log-item" style={{ cursor:'pointer' }} onClick={() => navigate('/app/wakeup')}>
                  <span style={{ fontSize:'18px' }}>⏰</span>
                  <span className="log-main">Log your wake-up</span>
                  <span className="badge badge-amber">pending</span>
                </div>
              )}
              {pendingHabits.slice(0, 5).map(h => (
                <div key={h.id} className="log-item" style={{ cursor:'pointer' }} onClick={() => navigate('/app/habits')}>
                  <span style={{ fontSize:'18px' }}>◻</span>
                  <span className="log-main">{h.name}</span>
                  <span className="badge badge-accent">{h.cat}</span>
                </div>
              ))}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
