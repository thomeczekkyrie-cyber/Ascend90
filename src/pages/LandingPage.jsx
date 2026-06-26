import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'

const features = [
  { icon: '⚖️', title: 'Weight Tracker', desc: 'Log daily weight, visualize your trend, and track progress toward your goal.' },
  { icon: '⏰', title: '4am Wake-Up Log', desc: 'Build the discipline of early rising. Track streaks across your full 90 days.' },
  { icon: '💪', title: 'Workout Tracker', desc: 'Log every session with type, duration, and notes. Watch your consistency grow.' },
  { icon: '✅', title: 'Daily Habits', desc: 'Custom habits with streak tracking and a 7-day dot history for each one.' },
  { icon: '🎯', title: 'Goals Board', desc: 'Write your 90-day goals, assign categories, and update status as you progress.' },
  { icon: '📋', title: 'Task Tracker', desc: 'Keep your businesses and personal tasks organized with priority levels.' },
  { icon: '📓', title: 'Daily Journal', desc: 'Log mood, energy, your biggest win, and reflections — all in one place.' },
  { icon: '📊', title: 'Dashboard', desc: 'One screen with every stat that matters. Your 90-day story at a glance.' },
]

const testimonials = [
  { name: 'Marcus T.', text: 'I went from 0 to 62 consecutive 4am wake-ups. The streak tracker is addictive.', role: 'Entrepreneur' },
  { name: 'Jordan L.', text: 'Lost 23 lbs in 90 days. Having everything in one place kept me honest.', role: 'Fitness coach' },
  { name: 'Priya M.', text: 'Finally launched my business AND got my health on track at the same time. This app made it feel manageable.', role: 'Founder' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* NAV */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', height:'64px', borderBottom:'1px solid var(--border)', position:'sticky', top:0, background:'var(--bg)', zIndex:100 }}>
        <img src="/logo.png" alt="Ascend90" style={{ height:'90px', objectFit:'contain' }} />
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          <button className="btn-ghost btn-sm" onClick={() => navigate('/pricing')}>Pricing</button>
          {user
            ? <button className="btn btn-sm" onClick={() => navigate('/app')}>Go to app</button>
            : <>
                <button className="btn-ghost btn-sm" onClick={() => navigate('/auth?mode=login')}>Sign in</button>
                <button className="btn btn-sm" onClick={() => navigate('/auth?mode=signup')}>Start free</button>
              </>
          }
        </div>
      </nav>

      {/* HERO */}
      <div style={{ textAlign:'center', padding:'80px 24px 60px', maxWidth:'700px', margin:'0 auto' }}>
        <div style={{ display:'inline-block', background:'var(--accent-soft)', color:'var(--accent)', fontSize:'12px', fontWeight:700, padding:'5px 14px', borderRadius:'20px', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'24px' }}>
          90-Day Transformation Tracker
        </div>
        <h1 style={{ fontSize:'clamp(36px, 6vw, 60px)', fontWeight:800, lineHeight:1.1, letterSpacing:'-1.5px', marginBottom:'22px' }}>
          90 days.<br />
          <span style={{ color:'var(--accent)' }}>No excuses.</span>
        </h1>
        <p style={{ fontSize:'18px', color:'var(--text2)', lineHeight:1.7, marginBottom:'36px', maxWidth:'520px', margin:'0 auto 36px' }}>
          Track your weight, wake-ups, workouts, habits, goals, and daily wins. Everything in one app built for people serious about a 90-day transformation.
        </p>
        <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
          <button className="btn" style={{ fontSize:'16px', padding:'12px 28px' }} onClick={() => navigate('/auth?mode=signup')}>
            Start free — no card needed
          </button>
          <button className="btn-ghost" style={{ fontSize:'16px', padding:'12px 28px' }} onClick={() => navigate('/pricing')}>
            See pricing
          </button>
        </div>
        <p style={{ marginTop:'16px', fontSize:'13px', color:'var(--text3)' }}>Free plan available. Premium unlocks everything for $8/mo.</p>
      </div>

      {/* FEATURES */}
      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'40px 24px' }}>
        <div style={{ textAlign:'center', marginBottom:'40px' }}>
          <h2 style={{ fontSize:'28px', fontWeight:700, letterSpacing:'-0.5px' }}>Everything you need. Nothing you don't.</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'14px' }}>
          {features.map(f => (
            <div key={f.title} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'14px', padding:'20px' }}>
              <div style={{ fontSize:'26px', marginBottom:'10px' }}>{f.icon}</div>
              <div style={{ fontSize:'15px', fontWeight:600, marginBottom:'6px' }}>{f.title}</div>
              <div style={{ fontSize:'13px', color:'var(--text2)', lineHeight:1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'20px 24px 60px' }}>
        <div style={{ textAlign:'center', marginBottom:'36px' }}>
          <h2 style={{ fontSize:'26px', fontWeight:700, letterSpacing:'-0.3px' }}>Real people. Real 90 days.</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:'14px' }}>
          {testimonials.map(t => (
            <div key={t.name} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'14px', padding:'22px' }}>
              <p style={{ fontSize:'14px', color:'var(--text)', lineHeight:1.7, marginBottom:'16px', fontStyle:'italic' }}>"{t.text}"</p>
              <div style={{ fontSize:'13px', fontWeight:600 }}>{t.name}</div>
              <div style={{ fontSize:'12px', color:'var(--text3)' }}>{t.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background:'var(--surface)', borderTop:'1px solid var(--border)', padding:'60px 24px', textAlign:'center' }}>
        <h2 style={{ fontSize:'28px', fontWeight:700, letterSpacing:'-0.5px', marginBottom:'14px' }}>Your 90 days start today.</h2>
        <p style={{ color:'var(--text2)', marginBottom:'28px', fontSize:'15px' }}>Free to start. No credit card. No excuses.</p>
        <button className="btn" style={{ fontSize:'16px', padding:'13px 32px' }} onClick={() => navigate('/auth?mode=signup')}>
          Create your free account →
        </button>
      </div>

      <footer style={{ borderTop:'1px solid var(--border)', padding:'24px', textAlign:'center', color:'var(--text3)', fontSize:'13px' }}>
        © 2025 Ascend90. Built for people who show up.
      </footer>
    </div>
  )
}
